from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class BaseModel(models.Model):
    """Abstract base model with common fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Game(BaseModel):
    """Game information model"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    genre = models.CharField(max_length=50)
    platform = models.JSONField(default=list)  # e.g., ['PC', 'PlayStation', 'Xbox']
    release_date = models.DateField(null=True, blank=True)
    developer = models.CharField(max_length=100, blank=True)
    publisher = models.CharField(max_length=100, blank=True)
    rating = models.CharField(max_length=10, blank=True)  # e.g., 'E', 'T', 'M'
    cover_image = models.ImageField(upload_to='games/covers/', null=True, blank=True)
    screenshots = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'core_game'
        verbose_name = 'Game'
        verbose_name_plural = 'Games'
        ordering = ['title']
    
    def __str__(self):
        return self.title


class GameSession(BaseModel):
    """Gaming session model"""
    SESSION_STATUS = [
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='sessions')
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_sessions')
    participants = models.ManyToManyField(User, through='SessionParticipant', related_name='joined_sessions')
    max_participants = models.PositiveIntegerField(default=4)
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField(null=True, blank=True)
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=SESSION_STATUS, default='scheduled')
    is_public = models.BooleanField(default=True)
    requirements = models.TextField(blank=True)  # Special requirements for joining
    voice_chat_link = models.URLField(blank=True)
    game_server_info = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'core_game_session'
        verbose_name = 'Game Session'
        verbose_name_plural = 'Game Sessions'
        ordering = ['-scheduled_start']
    
    def __str__(self):
        return f"{self.title} - {self.game.title}"
    
    @property
    def current_participants_count(self):
        return self.participants.count()
    
    @property
    def is_full(self):
        return self.current_participants_count >= self.max_participants
    
    @property
    def can_join(self):
        return not self.is_full and self.status == 'scheduled'


class SessionParticipant(BaseModel):
    """Through model for session participants"""
    PARTICIPANT_STATUS = [
        ('invited', 'Invited'),
        ('joined', 'Joined'),
        ('declined', 'Declined'),
        ('left', 'Left'),
        ('kicked', 'Kicked'),
    ]
    
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=PARTICIPANT_STATUS, default='joined')
    joined_at = models.DateTimeField(default=timezone.now)
    left_at = models.DateTimeField(null=True, blank=True)
    role = models.CharField(max_length=50, blank=True)  # e.g., 'leader', 'support', etc.
    
    class Meta:
        db_table = 'core_session_participant'
        verbose_name = 'Session Participant'
        verbose_name_plural = 'Session Participants'
        unique_together = ['session', 'user']
    
    def __str__(self):
        return f"{self.user.username} in {self.session.title}"


class GamePad(BaseModel):
    """Gaming pad/controller configuration model"""
    PAD_TYPES = [
        ('xbox', 'Xbox Controller'),
        ('playstation', 'PlayStation Controller'),
        ('nintendo', 'Nintendo Controller'),
        ('generic', 'Generic Controller'),
        ('custom', 'Custom Configuration'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_pads')
    name = models.CharField(max_length=100)
    pad_type = models.CharField(max_length=20, choices=PAD_TYPES)
    configuration = models.JSONField(default=dict)  # Button mappings, sensitivity, etc.
    games = models.ManyToManyField(Game, blank=True, related_name='compatible_pads')
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)  # Share configuration with community
    
    class Meta:
        db_table = 'core_game_pad'
        verbose_name = 'Game Pad'
        verbose_name_plural = 'Game Pads'
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Tournament(BaseModel):
    """Tournament model for competitive gaming"""
    TOURNAMENT_STATUS = [
        ('upcoming', 'Upcoming'),
        ('registration', 'Registration Open'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TOURNAMENT_TYPE = [
        ('single_elimination', 'Single Elimination'),
        ('double_elimination', 'Double Elimination'),
        ('round_robin', 'Round Robin'),
        ('league', 'League'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='tournaments')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_tournaments')
    tournament_type = models.CharField(max_length=30, choices=TOURNAMENT_TYPE)
    status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS, default='upcoming')
    max_participants = models.PositiveIntegerField()
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    tournament_start = models.DateTimeField()
    tournament_end = models.DateTimeField(null=True, blank=True)
    rules = models.TextField()
    requirements = models.TextField(blank=True)
    banner_image = models.ImageField(upload_to='tournaments/banners/', null=True, blank=True)
    participants = models.ManyToManyField(User, through='TournamentParticipant', related_name='tournaments')
    
    class Meta:
        db_table = 'core_tournament'
        verbose_name = 'Tournament'
        verbose_name_plural = 'Tournaments'
        ordering = ['-tournament_start']
    
    def __str__(self):
        return self.title


class TournamentParticipant(BaseModel):
    """Tournament participant model"""
    PARTICIPANT_STATUS = [
        ('registered', 'Registered'),
        ('confirmed', 'Confirmed'),
        ('disqualified', 'Disqualified'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=PARTICIPANT_STATUS, default='registered')
    registration_date = models.DateTimeField(default=timezone.now)
    seed = models.PositiveIntegerField(null=True, blank=True)  # Tournament seeding
    current_round = models.PositiveIntegerField(default=1)
    
    class Meta:
        db_table = 'core_tournament_participant'
        verbose_name = 'Tournament Participant'
        verbose_name_plural = 'Tournament Participants'
        unique_together = ['tournament', 'user']
    
    def __str__(self):
        return f"{self.user.username} in {self.tournament.title}"


class Achievement(BaseModel):
    """User achievements model"""
    ACHIEVEMENT_TYPE = [
        ('session', 'Session Achievement'),
        ('tournament', 'Tournament Achievement'),
        ('community', 'Community Achievement'),
        ('milestone', 'Milestone Achievement'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPE)
    badge_image = models.ImageField(upload_to='achievements/badges/', null=True, blank=True)
    points = models.PositiveIntegerField(default=0)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, null=True, blank=True)
    earned_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'core_achievement'
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
