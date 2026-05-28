from django.http import JsonResponse
from .models import RequestComponent

def component_options(request):
    return JsonResponse({
        "category_choices": RequestComponent.CATEGORY_CHOICES,
        "component_type_list": RequestComponent.component_type_list
    })
