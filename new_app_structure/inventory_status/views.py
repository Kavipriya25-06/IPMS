from rest_framework.decorators import api_view
from rest_framework.response import Response
from new_app_structure.models import inventory_status
from new_app_structure.inventory_status.serializers import inventory_status_serializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status



@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def inventory_status_view(request, serial_number=None):
    if request.method == 'GET':
        if serial_number:
            obj = inventory_status.objects.get(serial_number=serial_number)
            serializer=inventory_status_serializer(obj)
            return Response("inventory_status not found",status=status.HTTP_404_NOT_FOUND)
        else:
            obj = inventory_status.objects.select_related()
            serializers = inventory_status_serializer(obj, many=True)
            return Response(serializers.data, status=status.HTTP_200_OK)
        
    if request.method == "POST":
        data = request.data
        serializers = inventory_status_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)

    if request.method == "PUT":
        try:
            # Get the existing BOMMaster object by ID
            obj = inventory_status.objects.get(serial_number=serial_number)
        except inventory_status.DoesNotExist:
            return Response(
                {"error": "inventory_status id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = inventory_status_serializer(obj, data=request.data)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PATCH":
        try:
            # Get the existing BOMMaster object by ID
            obj = inventory_status.objects.get(serial_number=serial_number)
        except inventory_status.DoesNotExist:
            return Response(
                {"error": "inventory_status id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = inventory_status_serializer(obj, data=request.data, partial=True)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
