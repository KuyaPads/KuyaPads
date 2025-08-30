from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'gamer_tag', 
                   'skill_level', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_verified', 
                   'skill_level', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'gamer_tag')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('avatar', 'bio', 'location', 'birth_date', 'phone_number', 'is_verified')
        }),
        ('Gaming Information', {
            'fields': ('gamer_tag', 'skill_level', 'preferred_games', 'gaming_platforms')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile Information', {
            'fields': ('email', 'first_name', 'last_name', 'gamer_tag')
        }),
    )
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 50px;" />', obj.avatar.url)
        return "No avatar"
    avatar_preview.short_description = "Avatar"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'timezone', 'language', 'theme', 'play_style', 
                   'notifications_enabled', 'updated_at')
    list_filter = ('theme', 'play_style', 'notifications_enabled', 'email_notifications')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Preferences', {
            'fields': ('timezone', 'language', 'theme')
        }),
        ('Notifications', {
            'fields': ('notifications_enabled', 'email_notifications', 'marketing_emails')
        }),
        ('Gaming Preferences', {
            'fields': ('favorite_genres', 'play_style', 'availability')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
