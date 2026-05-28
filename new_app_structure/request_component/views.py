from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# from ..models import RequestComponent
from .serializers import RequestComponentSerializer

@api_view(['GET', 'POST'])
def request_component_view(request):
    if request.method == 'GET':
        status_param = request.GET.get('status')
        if status_param:
            components = RequestComponent.objects.filter(status=status_param).order_by('-request_date')
        else:
            components = RequestComponent.objects.all().order_by('-request_date')

        serializer = RequestComponentSerializer(components, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = RequestComponentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.http import JsonResponse
from new_app_structure.models import RequestComponent


def component_options(request):
    return JsonResponse({
        "category_choices": RequestComponent.CATEGORY_CHOICES,
        "component_type_list": RequestComponent.component_type_list
    })


@api_view(['GET', 'PATCH'])
def request_component_detail_view(request, pk):
    try:
        instance = RequestComponent.objects.get(pk=pk)
    except RequestComponent.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    if request.method == 'GET':
        serializer = RequestComponentSerializer(instance)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = RequestComponentSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['PATCH'])
def patch_vendor_added_by_component_id(request, component_id):
    try:
        # Find request component by status and component_id
        instance = RequestComponent.objects.filter(
            status="Added", component_id=component_id
        ).first()

        if not instance:
            return Response({"detail": "RequestComponent not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RequestComponentSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "vendor_added updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
