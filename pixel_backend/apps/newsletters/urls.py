from django.urls import path
from .views import *

urlpatterns = [

    # GET ALL
    path(
        '',
        get_newsletters
    ),

    # UPLOAD
    path(
        'upload/',
        upload_newsletter
    ),

    # EDIT
    path(
        'edit/<str:id>/',
        edit_newsletter
    ),

    # DELETE
    path(
        'delete/<str:id>/',
        delete_newsletter
    )

]