from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import UserProfile
from core.models import (
    Game, GameSession, SessionParticipant, GamePad,
    Tournament, TournamentParticipant, Achievement
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'avatar', 'bio', 'location', 'gamer_tag', 'skill_level',
                 'preferred_games', 'gaming_platforms', 'is_verified', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'is_verified')


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'gamer_tag')
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create user profile
        UserProfile.objects.create(user=user)
        return user


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'slug')


class SessionParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SessionParticipant
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class GameSessionSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    game_id = serializers.UUIDField(write_only=True)
    participants_detail = SessionParticipantSerializer(
        source='sessionparticipant_set', many=True, read_only=True
    )
    current_participants_count = serializers.ReadOnlyField()
    can_join = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = GameSession
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'host')
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id')
        validated_data['game'] = Game.objects.get(id=game_id)
        validated_data['host'] = self.context['request'].user
        return super().create(validated_data)


class GamePadSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GamePad
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TournamentParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TournamentParticipant
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class TournamentSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    game_id = serializers.UUIDField(write_only=True)
    participants_detail = TournamentParticipantSerializer(
        source='tournamentparticipant_set', many=True, read_only=True
    )
    participants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'organizer')
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    
    def create(self, validated_data):
        game_id = validated_data.pop('game_id')
        validated_data['game'] = Game.objects.get(id=game_id)
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class AchievementSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user', 'earned_at')


class DashboardSerializer(serializers.Serializer):
    """Serializer for user dashboard data"""
    user_stats = serializers.DictField()
    recent_sessions = GameSessionSerializer(many=True)
    upcoming_tournaments = TournamentSerializer(many=True)
    recent_achievements = AchievementSerializer(many=True)
    total_achievements = serializers.IntegerField()
    total_points = serializers.IntegerField()