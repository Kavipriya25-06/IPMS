from django.shortcuts import get_object_or_404, render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import Inward
from new_app_structure.Inward.serializers import get_InwardSerializer,inward_serializer
from datetime import datetime


@api_view(['GET','POST','PUT','PATCH','DELETE'])
def inward_view(request, inward_id=None):
    if request.method == 'PUT':
        try:
            # Get the existing BOMMaster object by ID
            obj = Inward.objects.get(inward_id=inward_id)
        except Inward.DoesNotExist:
            return Response({"error": "vendor id not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMMaster object with the new data
        serializer = inward_serializer(obj, data=request.data)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'PATCH':
        try:
            # Get the existing BOMMaster object by ID
            obj = Inward.objects.get(inward_id=inward_id)
        except Inward.DoesNotExist:
            return Response({"error": "BOMMaster not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMMaster object with the new data
        serializer = inward_serializer(obj, data=request.data, partial = True)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        if inward_id:
            try:
                obj = get_object_or_404(Inward, inward_id=inward_id)
                serializer = get_InwardSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Inward ID not found", "details": str(e)}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Filtering via query parameters
            po_id = request.GET.get('po_id')
            component_id = request.GET.get('component_id')
            date = request.GET.get('date')  # <-- ADD THIS

            queryset = Inward.objects.all()

            if po_id:
                queryset = queryset.filter(po_master_id__PO_id=po_id)
            if component_id:
                queryset = queryset.filter(po_master_id__cart_id__component_id=component_id)
            if date:
                queryset = queryset.filter(date=date)  # <-- ADD THIS

            if not queryset.exists():
                return Response({"message": "No matching inward records found"}, status=status.HTTP_204_NO_CONTENT)

            serializers = get_InwardSerializer(queryset, many=True)
            return Response(serializers.data)

                
    
    if request.method =='POST':
        data=request.data
        serializers=inward_serializer(data=data)
        if serializers.is_valid():
            serializers.save()  
            return Response(serializers.data)
        return Response(serializers.errors)




