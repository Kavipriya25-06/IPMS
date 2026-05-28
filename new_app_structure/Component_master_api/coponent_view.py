from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import ComponentMaster
from new_app_structure.serializers import ComponentMasterSerializer



@api_view(['GET','POST','PUT','PATCH','DELETE'])
def component_view(request, component_id=None):
    
    """
    Handle HTTP requests for ComponentMaster.

    Supports the following methods:
    - GET: Retrieve a list of all ComponentMaster entries.
    - POST: Create a new ComponentMaster entry with the provided data.
    - PUT: Update an existing ComponentMaster entry specified by request_id with the provided data.
    - PATCH: Partially update an existing ComponentMaster entry specified by request_id.
    - DELETE: Delete the ComponentMaster entry specified by request_id.

    Args:
        request: The HTTP request object containing method and data.
        request_id: Optional; The request_id of the ComponentMaster entry to retrieve, update, or delete.

    Returns:
        A Response object with serialized data for GET, POST, PUT, and PATCH requests,
        or a success/error message for DELETE requests, along with an appropriate HTTP status code.
    """
    
    

    if request.method == 'GET':
        if component_id:
            try:
                obj = ComponentMaster.objects.get(component_id=component_id)
                serializer = ComponentMasterSerializer(obj)
                return Response(serializer.data)
            except ComponentMaster.DoesNotExist:
                return Response(
                    {"error": "Component not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            queryset = ComponentMaster.objects.all()
            serializer = ComponentMasterSerializer(queryset, many=True)
            return Response(serializer.data)
    
    if request.method =='POST':
        data=request.data
        serializer=ComponentMasterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    if request.method =='DELETE':
        obj = ComponentMaster.objects.get(component_id=component_id)
        print(obj)
        return Response("request list deleted")
    
    
    if request.method == 'PUT':
        try:
        
            obj = ComponentMaster.objects.get(component_id=component_id)
        except ComponentMaster.DoesNotExist:
            return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        serializer = ComponentMasterSerializer(obj, data=request.data)
    
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
    if request.method == 'PATCH':
        try:
            obj = ComponentMaster.objects.get(component_id=component_id)
        except ComponentMaster.DoesNotExist:
            return Response({"error": "Component not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ComponentMasterSerializer(obj, data=request.data, partial=True)  # <-- important fix

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






###################### pagination ###################

# from django.shortcuts import render
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from rest_framework import status
# from rest_framework.pagination import CursorPagination
# from new_app_structure.models import ComponentMaster
# from new_app_structure.serializers import ComponentMasterSerializer
# from rest_framework.pagination import PageNumberPagination

# # class ComponentCursorPagination(CursorPagination):
# #     """
# #     Custom cursor pagination for ComponentMaster.
# #     """
# #     page_size = 15  # You can adjust the page size as needed
# #     ordering = ['ordering_id', 'component_id']  # Ensure ordering by a unique field

# #     def paginate_queryset(self, queryset, request, view=None):

# #         cursor_query_param = request.query_params.get(self.cursor_query_param)
# #         print(f"Cursor value: {cursor_query_param}")  # Log the cursor value

# #         # Call the parent method to paginate
# #         paginated_queryset = super().paginate_queryset(queryset, request, view)

# #         # Log the items being returned
# #         print(f"Number of items returned: {len(paginated_queryset)}")
# #         for item in paginated_queryset:
# #             print(f"ordering_id: {item.ordering_id}, component_id: {item.component_id}")

# #         return paginated_queryset
    
# # Log item count

# from rest_framework.pagination import PageNumberPagination

# class CustomListPagination(PageNumberPagination):
#     page_size = 10  # Number of items per page
#     page_size_query_param = "page_size"  # Allow client to specify page size
#     max_page_size = 100  # Limit maximum page size



# @api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
# def component_view(request, request_id=None):
#     """
#     Handle HTTP requests for ComponentMaster with page number-based pagination.

#     Supports the following methods:
#     - GET: Retrieve a paginated list of all ComponentMaster entries.
#     - POST: Create a new ComponentMaster entry.
#     - PUT: Update an existing ComponentMaster entry by request_id.
#     - PATCH: Partially update an existing ComponentMaster entry by request_id.
#     - DELETE: Delete the specified ComponentMaster entry.
#     """


#     if request.method == 'GET':
#         queryset = ComponentMaster.objects.all().order_by('ordering_id')  # Ensure queryset is ordered
        
#         # Use the custom page number pagination class
#         paginator = CustomListPagination()

#         # Apply pagination
#         paginated_queryset = paginator.paginate_queryset(queryset, request)
#         if paginated_queryset is not None:
#             serializer = ComponentMasterSerializer(paginated_queryset, many=True)
#             return paginator.get_paginated_response(serializer.data)
        
#         # If no pagination, return the full list
#         serializer = ComponentMasterSerializer(queryset, many=True)
#         return Response(serializer.data)
    
#     elif request.method == 'POST':
#         data = request.data
#         serializer = ComponentMasterSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     elif request.method == 'DELETE':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#             obj.delete()
#             return Response({"message": "ComponentMaster entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#     elif request.method == 'PUT':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = ComponentMasterSerializer(obj, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     elif request.method == 'PATCH':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = ComponentMasterSerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.pagination import PageNumberPagination
# from new_app_structure.models import ComponentMaster
# from .serializers import ComponentMasterSerializer


# class CustomListPagination(PageNumberPagination):
#     """
#     Custom pagination class that implements page number-based pagination.
#     """
#     page_size = 15  # Number of items per page
#     page_size_query_param = "page_size"  # Allow clients to specify page size
#     max_page_size = 100  # Limit maximum page size


# @api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
# def component_view(request, request_id=None):
#     """
#     Handle HTTP requests for ComponentMaster with page number-based pagination.

#     Supports the following methods:
#     - GET: Retrieve a paginated list of all ComponentMaster entries.
#     - POST: Create a new ComponentMaster entry.
#     - PUT: Update an existing ComponentMaster entry by request_id.
#     - PATCH: Partially update an existing ComponentMaster entry by request_id.
#     - DELETE: Delete the specified ComponentMaster entry.
#     """

#     if request.method == 'GET':
#         queryset = ComponentMaster.objects.all().order_by('ordering_id')  # Ensure queryset is ordered
        
#         # Use the page number pagination class
#         paginator = CustomListPagination()

#         # Apply pagination
#         paginated_queryset = paginator.paginate_queryset(queryset, request)
#         if paginated_queryset is not None:
#             serializer = ComponentMasterSerializer(paginated_queryset, many=True)
#             return paginator.get_paginated_response(serializer.data)

#         # If no pagination is applied, return the full list
#         serializer = ComponentMasterSerializer(queryset, many=True)
#         return Response(serializer.data)

#     elif request.method == 'POST':
#         data = request.data
#         serializer = ComponentMasterSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     elif request.method == 'DELETE':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#             obj.delete()
#             return Response({"message": "ComponentMaster entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#     elif request.method == 'PUT':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = ComponentMasterSerializer(obj, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     elif request.method == 'PATCH':
#         try:
#             obj = ComponentMaster.objects.get(id=request_id)
#         except ComponentMaster.DoesNotExist:
#             return Response({"error": "ComponentMaster entry not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = ComponentMasterSerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST )

