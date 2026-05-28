from rest_framework import serializers
from new_app_structure.models import ComponentMaster, tags_table




class tagsSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = tags_table
        fields = '__all__'

# class componentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ComponentMaster
#         fields = ['component_id','component_type','component_specification','unit_of_measurement']



# class tagsSerializer_2(serializers.ModelSerializer):
#     component_id=componentSerializer()
#     class Meta:
#         model = tags_table
#         fields = ['component_id','tags']


# class ComponentMasterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ComponentMaster
#         fields = ['component_id', 'component_type', 'component_specification', 'unit_of_measurement']


# class tagsSerializer_2(serializers.ModelSerializer):
#     component_id = ComponentMasterSerializer()  # Include nested details from ComponentMaster
#     tags = serializers.SerializerMethodField()  # Convert related tags into a list

#     class Meta:
#         model = tags_table
#         fields = ['component_id', 'tags']

#     def get_tags(self, obj):
#         # Return a list of related tag names
#         return [obj.tags_choices.tags]



class ComponentMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentMaster
        fields = ['component_id', 'component_type', 'component_specification', 'unit_of_measurement',  'category','hsn_number','sku_number','part_number']


class tagsSerializer_2(serializers.ModelSerializer):
    # FK -> nested component details
    component_id = ComponentMasterSerializer(read_only=True)

    # If your model has a `tags` text field, keep it.
    # If you want tags always as LIST, convert here.
    tags = serializers.SerializerMethodField()

    class Meta:
        model = tags_table
        fields = [
            "id",
            "component_id",
            "tags",
        ]

    def get_tags(self, obj):
        """
        Return tags as a list.
        This supports multiple common DB designs:

        1) If tags_table has `tags` as string -> "abc"
        2) If tags_table has tags_choices FK -> tags_choices.tags
        3) If you already store tags as list -> return it directly
        """
        # Case A: tags already exists in table
        if hasattr(obj, "tags") and obj.tags:
            # if it's already a list
            if isinstance(obj.tags, list):
                return obj.tags
            # if it's comma-separated string
            if isinstance(obj.tags, str):
                # split by comma safely
                return [t.strip() for t in obj.tags.split(",") if t.strip()]

        # Case B: tags_choices FK exists
        if hasattr(obj, "tags_choices") and obj.tags_choices:
            # tags_choices model should have a field called "tags"
            return [str(obj.tags_choices.tags)]

        return []