from django.urls import path
from .views import *

urlpatterns=[

path(
'',
get_moments
),

path(
'create/',
create_moment
),

path(
'delete/str:id/',
delete_moment
),

path(
'like/',
like_moment
),

path(
'comment/',
comment_moment
),

]