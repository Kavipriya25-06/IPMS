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
from new_app_structure.models import create_MRF, MRFList, MRFsubList
from new_app_structure.createMRFsublist.serializers import mrf_sub_list_Serializer


@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def MRF_sub_list_table(request, id=None):
    if request.method == "GET":
        if id:
            try:
                obj = MRFsubList.objects.get(id=id)
                serializer = mrf_sub_list_Serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except MRFsubList.DoesNotExist:
                return Response(
                    {"error": "MRF not found."}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Fetch all POs
            objs = MRFsubList.objects.all()
        serializer = mrf_sub_list_Serializer(objs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        data = request.data
        serializers = mrf_sub_list_Serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)

    if request.method == "PUT":
        try:
            # Get the existing BOMMaster object by ID
            obj = MRFsubList.objects.get(id=id)
        except MRFsubList.DoesNotExist:
            return Response(
                {"error": "id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = mrf_sub_list_Serializer(obj, data=request.data)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PATCH":
        try:
            # Get the existing BOMMaster object by ID
            obj = MRFsubList.objects.get(id=id)
        except MRFsubList.DoesNotExist:
            return Response(
                {"error": "id not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update the BOMMaster object with the new data
        serializer = mrf_sub_list_Serializer(obj, data=request.data, partial=True)

        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
