import xml.etree.ElementTree as ET
import os

# Define the namespace
ET.register_namespace('', "http://soap.sforce.com/2006/04/metadata")
namespace = {'ns': 'http://soap.sforce.com/2006/04/metadata'}

# Paths
perm_set_path = r'c:\Users\sunil\VikasSchool\force-app\main\default\permissionsets\EduTrack_Full_Access.permissionset-meta.xml'
objects_dir = r'c:\Users\sunil\VikasSchool\force-app\main\default\objects'
classes_dir = r'c:\Users\sunil\VikasSchool\force-app\main\default\classes'

# Get list of valid objects and their fields
valid_objects = set(os.listdir(objects_dir))
valid_fields = set()
for obj in valid_objects:
    fields_path = os.path.join(objects_dir, obj, 'fields')
    if os.path.exists(fields_path):
        for f in os.listdir(fields_path):
            if f.endswith('.field-meta.xml'):
                fname = f.replace('.field-meta.xml', '')
                valid_fields.add(f"{obj}.{fname}")

# Get list of valid classes
valid_classes = set()
if os.path.exists(classes_dir):
    for c in os.listdir(classes_dir):
        if c.endswith('.cls'):
            valid_classes.add(c.replace('.cls', ''))

# Parse current perm set
tree = ET.parse(perm_set_path)
root = tree.getroot()

# Items to remove
to_remove = []

for child in root:
    tag = child.tag.replace('{http://soap.sforce.com/2006/04/metadata}', '')
    
    if tag == 'classAccess':
        cls_name = child.find('ns:apexClass', namespace).text
        if cls_name not in valid_classes:
            to_remove.append(child)
            
    elif tag == 'objectPermissions':
        obj_name = child.find('ns:object', namespace).text
        if obj_name not in valid_objects:
            to_remove.append(child)
            
    elif tag == 'fieldPermissions':
        field_name = child.find('ns:field', namespace).text
        # Keep if it's a valid custom field or a known standard field that is NOT problematic
        # Actually, let's keep ONLY custom fields for now to be safe, or known standard fields
        if '.' in field_name:
            obj, fld = field_name.split('.', 1)
            if obj not in valid_objects:
                to_remove.append(child)
            elif fld.endswith('__c'):
                if field_name not in valid_fields:
                    to_remove.append(child)
            else:
                # Standard field - keep only if it didn't cause errors
                problematic = ['ChannelProgramLevelName', 'ChannelProgramName', 'IsCustomerPortal', 'IsPartner', 'PartnerAccountId', 'CostBookId']
                if fld in problematic:
                    to_remove.append(child)

# Remove the items
for item in to_remove:
    root.remove(item)

# Sort the children to ensure alphabetical order if needed, but ET doesn't do it easily.
# Salesforce expects tags grouped by type.
# Types in order: classAccess, fieldPermissions, hasActivationRequired, label, objectPermissions

# Group and sort
children = list(root)
root[:] = [] # Clear root

# Define tag order
tag_order = ['classAccess', 'fieldPermissions', 'hasActivationRequired', 'label', 'objectPermissions']

for t in tag_order:
    sub = sorted([c for c in children if c.tag.replace('{http://soap.sforce.com/2006/04/metadata}', '') == t], 
                 key=lambda x: (x.find('.//ns:apexClass', namespace).text if x.find('.//ns:apexClass', namespace) is not None else 
                                (x.find('.//ns:field', namespace).text if x.find('.//ns:field', namespace) is not None else 
                                 (x.find('.//ns:object', namespace).text if x.find('.//ns:object', namespace) is not None else ""))))
    for s in sub:
        root.append(s)

# Write back
tree.write(perm_set_path, encoding='UTF-8', xml_declaration=True)
print("Surgically cleaned and ordered Permission Set")
