from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta

from users.models import UserProfile
from core.models import (
    Game, GameSession, SessionParticipant, GamePad,
    Tournament, TournamentParticipant, Achievement
)
from .serializers import (
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    GameSerializer, GameSessionSerializer, GamePadSerializer,
    TournamentSerializer, AchievementSerializer, DashboardSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain pair view with user information"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(email=request.data.get('email'))
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        return response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user's profile"""
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user fields
        user_fields = ['first_name', 'last_name', 'bio', 'location', 'gamer_tag', 
                      'skill_level', 'preferred_games', 'gaming_platforms']
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        
        # Update profile fields
        profile_serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'profile': profile_serializer.data
            })
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get user dashboard data"""
        user = request.user
        
        # User statistics
        user_stats = {
            'total_sessions_hosted': GameSession.objects.filter(host=user).count(),
            'total_sessions_joined': SessionParticipant.objects.filter(user=user).count(),
            'total_tournaments': TournamentParticipant.objects.filter(user=user).count(),
            'total_achievements': Achievement.objects.filter(user=user).count(),
            'total_points': Achievement.objects.filter(user=user).aggregate(
                total=Sum('points'))['total'] or 0,
        }
        
        # Recent sessions
        recent_sessions = GameSession.objects.filter(
            Q(host=user) | Q(participants=user)
        ).distinct().order_by('-created_at')[:5]
        
        # Upcoming tournaments
        upcoming_tournaments = Tournament.objects.filter(
            participants=user,
            tournament_start__gte=timezone.now()
        ).order_by('tournament_start')[:5]
        
        # Recent achievements
        recent_achievements = Achievement.objects.filter(
            user=user
        ).order_by('-earned_at')[:10]
        
        dashboard_data = {
            'user_stats': user_stats,
            'recent_sessions': GameSessionSerializer(recent_sessions, many=True).data,
            'upcoming_tournaments': TournamentSerializer(upcoming_tournaments, many=True).data,
            'recent_achievements': AchievementSerializer(recent_achievements, many=True).data,
            'total_achievements': user_stats['total_achievements'],
            'total_points': user_stats['total_points']
        }
        
        serializer = DashboardSerializer(dashboard_data)
        return Response(serializer.data)


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        genre = self.request.query_params.get('genre')
        platform = self.request.query_params.get('platform')
        search = self.request.query_params.get('search')
        
        if genre:
            queryset = queryset.filter(genre__icontains=genre)
        if platform:
            queryset = queryset.filter(platform__contains=platform)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(developer__icontains=search)
            )
        
        return queryset


class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by query parameters
        status_filter = self.request.query_params.get('status')
        game_id = self.request.query_params.get('game')
        hosted_by_me = self.request.query_params.get('hosted_by_me')
        joined_by_me = self.request.query_params.get('joined_by_me')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if game_id:
            queryset = queryset.filter(game__id=game_id)
        if hosted_by_me == 'true':
            queryset = queryset.filter(host=user)
        if joined_by_me == 'true':
            queryset = queryset.filter(participants=user)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a game session"""
        session = self.get_object()
        user = request.user
        
        if not session.can_join:
            return Response(
                {'error': 'Cannot join this session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant, created = SessionParticipant.objects.get_or_create(
            session=session,
            user=user,
            defaults={'status': 'joined'}
        )
        
        if created:
            return Response({'message': 'Successfully joined session'})
        else:
            return Response(
                {'error': 'Already joined this session'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a game session"""
        session = self.get_object()
        user = request.user
        
        try:
            participant = SessionParticipant.objects.get(session=session, user=user)
            participant.status = 'left'
            participant.left_at = timezone.now()
            participant.save()
            return Response({'message': 'Successfully left session'})
        except SessionParticipant.DoesNotExist:
            return Response(
                {'error': 'Not a participant in this session'},
                status=status.HTTP_400_BAD_REQUEST
            )


class GamePadViewSet(viewsets.ModelViewSet):
    queryset = GamePad.objects.all()
    serializer_class = GamePadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return GamePad.objects.filter(user=user).order_by('-created_at')


class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        game_id = self.request.query_params.get('game')
        organized_by_me = self.request.query_params.get('organized_by_me')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if game_id:
            queryset = queryset.filter(game__id=game_id)
        if organized_by_me == 'true':
            queryset = queryset.filter(organizer=self.request.user)
        
        return queryset.order_by('-tournament_start')
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register for a tournament"""
        tournament = self.get_object()
        user = request.user
        
        if tournament.status != 'registration':
            return Response(
                {'error': 'Tournament registration is not open'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if tournament.participants.count() >= tournament.max_participants:
            return Response(
                {'error': 'Tournament is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant, created = TournamentParticipant.objects.get_or_create(
            tournament=tournament,
            user=user,
            defaults={'status': 'registered'}
        )
        
        if created:
            return Response({'message': 'Successfully registered for tournament'})
        else:
            return Response(
                {'error': 'Already registered for this tournament'},
                status=status.HTTP_400_BAD_REQUEST
            )


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Achievement.objects.filter(user=user).order_by('-earned_at')
