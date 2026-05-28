from rest_framework.decorators import api_view
from rest_framework.response import Response
from new_app_structure.models import Reserved, RequestMaster
from new_app_structure.reserve.serializer import ReservedSerializer
from new_app_structure.createMRF.serializers import mrf_Serializer

from new_app_structure.models import create_MRF
from rest_framework import status

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from new_app_structure.models import create_MRF


@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def create_MRF_table(request, MRF_id=None):
    if request.method == "GET":
        if MRF_id:
            try:
                obj = create_MRF.objects.get(MRF_id=MRF_id)
                serializer = mrf_Serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except create_MRF.DoesNotExist:
                return Response(
                    {"error": "PO not found."}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Fetch all POs
            objs = create_MRF.objects.all()
        serializer = mrf_Serializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        data = request.data
        serializers = mrf_Serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)

    if request.method == "PUT":
        try:
            # Get the existing BOMMaster object by ID
            obj = create_MRF.objects.get(MRF_id=MRF_id)
        except create_MRF.DoesNotExist:
            return Response(
                {"error": "MRF_id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = mrf_Serializer(obj, data=request.data)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PATCH":
        try:
            # Get the existing BOMMaster object by ID
            obj = create_MRF.objects.get(MRF_id=MRF_id)
        except create_MRF.DoesNotExist:
            return Response(
                {"error": "MRF_id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = mrf_Serializer(obj, data=request.data, partial=True)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
