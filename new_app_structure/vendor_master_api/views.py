from django.http import JsonResponse
from django.shortcuts import render

# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from rest_framework import status

from new_app_structure.models import VendorMaster
from new_app_structure.vendor_master_api.serializers import vendor_master_serializer
from rest_framework.response import Response
# from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import VendorMaster
from new_app_structure.vendor_master_api.serializers import vendor_master_serializer

from rest_framework.decorators import api_view, parser_classes


from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])


def vendor_master(request, product_id=None):
    # GET method
    if request.method == 'GET':
        if product_id:
            try:
                obj = VendorMaster.objects.get(product_id=product_id)
                serializer = vendor_master_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except VendorMaster.DoesNotExist:
                return Response({"error": "VendorMaster product_id not valid"}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = VendorMaster.objects.all()
            serializer = vendor_master_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    # POST method
    if request.method == 'POST':
        serializer = vendor_master_serializer(data=request.data)  # Remove files=request.FILES
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT method
    if request.method == 'PATCH':
        if not product_id:
            return Response({"error": "product_id is required for updating an item"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            obj = VendorMaster.objects.get(product_id=product_id)
        except VendorMaster.DoesNotExist:
            return Response({"error": "VendorMaster product_id not found."}, status=status.HTTP_404_NOT_FOUND)
        
    

        serializer = vendor_master_serializer(obj, data=request.data,partial=True)  # Remove files=request.FILES
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'PUT':
        if not product_id:
            return Response({"error": "product_id is required for updating an item"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            obj = VendorMaster.objects.get(product_id=product_id)
        except VendorMaster.DoesNotExist:
            return Response({"error": "VendorMaster product_id not found."}, status=status.HTTP_404_NOT_FOUND)
        
    

        serializer = vendor_master_serializer(obj, data=request.data)  # Remove files=request.FILES
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    



@api_view(['GET'])
def get_choices(request):
    """
    Handle GET request to retrieve dropdown choices for component types and categories.

    This function handles a GET request by fetching the component type and category choices
    from the VendorMaster model and returns them as JSON response.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse: A JSON response containing component type and category choices.
    """
    if request.method == "GET":
        # Retrieve component type choices from VendorMaster model
        component_type_choices = dict(VendorMaster.component_type_list)

        # Retrieve category choices from VendorMaster model
        category_choices = dict(VendorMaster.CATEGORY_CHOICES)

        # Return the choices as a JSON response
        return Response({
            "component_type_list": list(component_type_choices.items()),
            "category_choices": list(category_choices.items()),
        })


