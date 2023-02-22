from django.urls import path, re_path
from . import views

# tell our server what functions to run when user clicks this specified URL

#added str and int to month variable to tel python how to handle in the incoming request
#order matters, in that it will try the first item in the list, then the 2nd
urlpatterns = [
    path("", views.index), # the "" represents the root level
    path('my-ajax-test/', views.myajaxtestview, name='ajax-test-view'),
    ]
