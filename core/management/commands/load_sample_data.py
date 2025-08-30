from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Game
from django.utils.text import slugify
from datetime import date

User = get_user_model()


class Command(BaseCommand):
    help = 'Load sample data into the database'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Loading sample data...'))
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@kuyapads.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin/admin123'))
        
        # Create sample games
        games_data = [
            {
                'title': 'League of Legends',
                'description': 'A multiplayer online battle arena game where teams compete to destroy the opposing team\'s nexus.',
                'genre': 'MOBA',
                'platform': ['PC'],
                'developer': 'Riot Games',
                'publisher': 'Riot Games',
                'rating': 'T',
                'tags': ['competitive', 'strategy', 'teamwork']
            },
            {
                'title': 'Counter-Strike: Global Offensive',
                'description': 'A multiplayer first-person shooter featuring classic gameplay and competitive matches.',
                'genre': 'FPS',
                'platform': ['PC', 'PlayStation', 'Xbox'],
                'developer': 'Valve Corporation',
                'publisher': 'Valve Corporation',
                'rating': 'M',
                'tags': ['competitive', 'tactical', 'fps']
            },
            {
                'title': 'Valorant',
                'description': 'A tactical first-person shooter with unique character abilities.',
                'genre': 'FPS',
                'platform': ['PC'],
                'developer': 'Riot Games',
                'publisher': 'Riot Games',
                'rating': 'T',
                'tags': ['tactical', 'abilities', 'competitive']
            },
            {
                'title': 'Rocket League',
                'description': 'A unique game combining soccer with rocket-powered cars.',
                'genre': 'Sports',
                'platform': ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
                'developer': 'Psyonix',
                'publisher': 'Epic Games',
                'rating': 'E',
                'tags': ['sports', 'cars', 'fun']
            },
            {
                'title': 'Among Us',
                'description': 'A social deduction game where crewmates work together to identify impostors.',
                'genre': 'Social Deduction',
                'platform': ['PC', 'Mobile', 'PlayStation', 'Xbox', 'Nintendo Switch'],
                'developer': 'Innersloth',
                'publisher': 'Innersloth',
                'rating': 'E',
                'tags': ['social', 'deduction', 'party']
            },
            {
                'title': 'Minecraft',
                'description': 'A sandbox game where players can build and explore infinite worlds.',
                'genre': 'Sandbox',
                'platform': ['PC', 'PlayStation', 'Xbox', 'Mobile', 'Nintendo Switch'],
                'developer': 'Mojang Studios',
                'publisher': 'Microsoft',
                'rating': 'E',
                'tags': ['creative', 'building', 'survival']
            }
        ]
        
        created_games = 0
        for game_data in games_data:
            game_data['slug'] = slugify(game_data['title'])
            game, created = Game.objects.get_or_create(
                title=game_data['title'],
                defaults=game_data
            )
            if created:
                created_games += 1
                self.stdout.write(f'Created game: {game.title}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded sample data! Created {created_games} games.')
        )
        
        # Print some helpful information
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('KuyaPads Platform Setup Complete!'))
        self.stdout.write('='*50)
        self.stdout.write('\nAdmin credentials:')
        self.stdout.write('  Username: admin')
        self.stdout.write('  Email: admin@kuyapads.com')
        self.stdout.write('  Password: admin123')
        self.stdout.write(f'\nGames created: {Game.objects.count()}')
        self.stdout.write(f'Users created: {User.objects.count()}')
        self.stdout.write('\nYou can now:')
        self.stdout.write('  1. Access the admin at /admin/')
        self.stdout.write('  2. Access the API at /api/')
        self.stdout.write('  3. View API documentation at /api/docs/')
        self.stdout.write('='*50)