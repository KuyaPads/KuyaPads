from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, UserViewSet, GameViewSet,
    GameSessionViewSet, GamePadViewSet, TournamentViewSet, AchievementViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'games', GameViewSet)
router.register(r'sessions', GameSessionViewSet)
router.register(r'gamepads', GamePadViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'achievements', AchievementViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('', include(router.urls)),
]