from new_app_structure.models import project_details, RequestMaster, RequestList, RequestMaster, BOMList, BOMMaster, po_list, po_master
from rest_framework import serializers


class project_details_Serializer(serializers.ModelSerializer):

    class Meta:
        model = project_details
        fields = '__all__'



class RequestMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestMaster
        fields = '__all__'

class RequestListSerializer(serializers.ModelSerializer):
    requests = RequestMasterSerializer(many=True, read_only=True, source="requestmaster_set")

    class Meta:
        model = RequestList
        fields = ['request_id', 'requester_name', 'date', 'status', 'last_modified_by', 'bom', 'bom_name', 'requests']


class ProjectDetailsSerializer(serializers.ModelSerializer):
    # requests = RequestMasterSerializer(many=True, read_only=True)  # Fetch related requests
    requests = serializers.SerializerMethodField()

    class Meta:
        model = project_details
        fields = ['project_id', 'project_name', 'description', 'start_date', 'requests','Project_type']

    def get_requests(self, obj):
        return RequestMasterSerializer(obj.requestmaster_set.all(), many=True).data
    
    
class BOMMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOMMaster
        fields = '__all__'

class BOMListSerializer(serializers.ModelSerializer):
    bom_details = BOMMasterSerializer(many=True, read_only=True, source="bom_master")

    class Meta:
        model = BOMList
        fields = ['bom_id', 'bom_name', 'number_of_components', 'created_by', 'created_date', 'last_modified_by', 'last_modified_date', 'bom_details']



class POListSerializer(serializers.ModelSerializer):
    class Meta:
        model = po_list
        fields = '__all__'

class POMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = po_master
        fields = '__all__'

