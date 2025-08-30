"""
URL Configuration for KuyaPads Platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
    openapi.Info(
        title="KuyaPads Platform API",
        default_version='v1',
        description="API documentation for KuyaPads gaming platform",
        terms_of_service="https://www.kuyapads.com/terms/",
        contact=openapi.Contact(email="support@kuyapads.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Welcome to KuyaPads Platform API',
        'version': '1.0.0',
        'documentation': '/api/docs/',
        'endpoints': {
            'authentication': '/api/auth/',
            'users': '/api/users/',
            'games': '/api/games/',
            'sessions': '/api/sessions/',
            'gamepads': '/api/gamepads/',
            'tournaments': '/api/tournaments/',
            'achievements': '/api/achievements/',
        }
    })

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API root
    path('api/', api_root, name='api-root'),
    
    # API endpoints
    path('api/', include('api.urls')),
    
    # OAuth2 provider
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Add debug toolbar if available
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass

# Custom error handlers
handler400 = 'django.views.defaults.bad_request'
handler403 = 'django.views.defaults.permission_denied'
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'
