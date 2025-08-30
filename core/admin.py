from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Game, GameSession, SessionParticipant, GamePad, 
    Tournament, TournamentParticipant, Achievement
)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'developer', 'rating', 'is_active', 'created_at')
    list_filter = ('genre', 'rating', 'is_active', 'platform')
    search_fields = ('title', 'developer', 'publisher', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'genre', 'is_active')
        }),
        ('Game Details', {
            'fields': ('platform', 'release_date', 'developer', 'publisher', 'rating')
        }),
        ('Media', {
            'fields': ('cover_image', 'screenshots')
        }),
        ('Tags & Classification', {
            'fields': ('tags',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="max-height: 100px;" />', obj.cover_image.url)
        return "No cover image"
    cover_preview.short_description = "Cover Preview"


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'game', 'host', 'status', 'participants_count', 
                   'max_participants', 'scheduled_start', 'is_public')
    list_filter = ('status', 'is_public', 'game', 'scheduled_start')
    search_fields = ('title', 'description', 'host__username', 'game__title')
    readonly_fields = ('id', 'created_at', 'updated_at', 'current_participants_count')
    
    def participants_count(self, obj):
        return f"{obj.current_participants_count}/{obj.max_participants}"
    participants_count.short_description = "Participants"


class SessionParticipantInline(admin.TabularInline):
    model = SessionParticipant
    extra = 0
    readonly_fields = ('joined_at',)


@admin.register(SessionParticipant)
class SessionParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'status', 'role', 'joined_at')
    list_filter = ('status', 'session__game', 'joined_at')
    search_fields = ('user__username', 'session__title')


@admin.register(GamePad)
class GamePadAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'pad_type', 'is_default', 'is_public', 'created_at')
    list_filter = ('pad_type', 'is_default', 'is_public')
    search_fields = ('name', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('title', 'game', 'organizer', 'status', 'tournament_type', 
                   'max_participants', 'tournament_start')
    list_filter = ('status', 'tournament_type', 'game', 'tournament_start')
    search_fields = ('title', 'description', 'organizer__username')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'game', 'organizer')
        }),
        ('Tournament Configuration', {
            'fields': ('tournament_type', 'status', 'max_participants')
        }),
        ('Financial Information', {
            'fields': ('entry_fee', 'prize_pool')
        }),
        ('Schedule', {
            'fields': ('registration_start', 'registration_end', 
                      'tournament_start', 'tournament_end')
        }),
        ('Rules & Requirements', {
            'fields': ('rules', 'requirements')
        }),
        ('Media', {
            'fields': ('banner_image',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TournamentParticipant)
class TournamentParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'tournament', 'status', 'seed', 'current_round', 'registration_date')
    list_filter = ('status', 'tournament__game', 'current_round')
    search_fields = ('user__username', 'tournament__title')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'achievement_type', 'points', 'game', 'earned_at')
    list_filter = ('achievement_type', 'game', 'earned_at')
    search_fields = ('title', 'user__username', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def badge_preview(self, obj):
        if obj.badge_image:
            return format_html('<img src="{}" style="max-height: 50px;" />', obj.badge_image.url)
        return "No badge"
    badge_preview.short_description = "Badge Preview"
