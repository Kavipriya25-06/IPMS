from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from new_app_structure.models import VendorMaster, VendorProductImage
from .serializers import VendorProductImageSerializer

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_component_images(request, component_id=None):
    if request.method == 'POST':
        images = request.FILES.getlist('images')
        if not images:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for image in images:
            instance = VendorProductImage.objects.create(component_id=component_id, image=image)
            instances.append(instance)

        serializer = VendorProductImageSerializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    elif request.method == 'GET':
        if component_id:
            images = VendorProductImage.objects.filter(component_id=component_id)
        else:
            images = VendorProductImage.objects.all()

        serializer = VendorProductImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_component_image(request, image_id):
    try:
        image = VendorProductImage.objects.get(id=image_id)
        image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except VendorProductImage.DoesNotExist:
        return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)