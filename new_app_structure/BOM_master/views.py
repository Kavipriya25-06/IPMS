# from django.shortcuts import get_object_or_404
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from rest_framework import status
# from new_app_structure.models import BOMMaster
# from new_app_structure.BOM_master.serializers import BOMMasterSerializer


# @api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
# def BOM_master(request, id=None):
#     if request.method == 'GET':
      
#             objs = BOMMaster.objects.all()
#             serializer = BOMMasterSerializer(objs, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#     if request.method == 'POST':
#         serializer = BOMMasterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if not id:
#         return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)

#     obj = get_object_or_404(BOMMaster, id=id)
#     partial = request.method == 'PATCH'
#     serializer = BOMMasterSerializer(obj, data=request.data, partial=partial)

#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     if request.method == 'DELETE':
#         obj.delete()
#         return Response({"message": "BOMMaster deleted successfully."}, status=status.HTTP_204_NO_CONTENT)





from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from new_app_structure.models import BOMMaster, ComponentMaster, VendorMaster,RequestMaster
from new_app_structure.BOM_master.serializers import ComponentMasterSerializer, GET_BOMMasterSerializer, POST_BOMMasterSerializer

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def BOM_master(request, id=None):
    """
    Handles CRUD operations for BOMMaster objects.

    GET:
    * Retrieves all BOMMaster objects if no `id` is provided.
    * Retrieves a single BOMMaster object by `id` if provided.

    POST:
    * Creates a new BOMMaster object with the provided data.

    PUT:
    * Updates an existing BOMMaster object with the provided data.

    PATCH:
    * Partially updates an existing BOMMaster object with the provided data.

    DELETE:
    * Deletes an existing BOMMaster object by `id`.
    """
    
    if request.method == 'GET':
        if id:
            # Retrieve a single BOMMaster object by ID
            obj = get_object_or_404(BOMMaster, id=id)
            serializer = GET_BOMMasterSerializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Retrieve all BOMMaster objects
            objs = BOMMaster.objects.all()
            serializer = GET_BOMMasterSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = POST_BOMMasterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method in ['PUT', 'PATCH']:
        if not id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(BOMMaster, id=id)
        partial = request.method == 'PATCH'
        serializer = POST_BOMMasterSerializer(obj, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(BOMMaster, id=id)
        obj.delete()
        return Response({"message": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)




"""
    Handles GET requests for retrieving all ComponentMaster objects.

    Returns a JSON response containing an array of ComponentMaster objects with
    their respective vendor details.

"""



@api_view(['GET'])




def all_vendors_components_view(request):
   
   components = ComponentMaster.objects.select_related('product_id__vendor').all()  # Optimize query with select_related
   serializer = ComponentMasterSerializer(components, many=True)
   return Response(serializer.data)




from new_app_structure.BOM_master.serializers import RequestMasterSerializer_2

@api_view(['GET'])

def price_view_new(request):
    # import pdb
    # pdb.set_trace()
    components = VendorMaster.objects.all()  # Optimize query with select_related
    print()
    serializer = RequestMasterSerializer_2(components, many=True)
    return Response(serializer.data)






