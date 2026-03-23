$TargetDir = "packaged-src/main/default"

mkdir "$TargetDir\lwc" -ErrorAction SilentlyContinue
mkdir "$TargetDir\classes" -ErrorAction SilentlyContinue

# 1. List of LWC to move
$LwcList = @(
    "admissionManager", "attendance", "attendanceReport", "bulkStudentImport", 
    "complaintbox", "eduProDashboard", "enterMarks", "expenseManagement", 
    "gradesModule", "payTheBill", "priceBookSetup", "schoolSetup", 
    "student", "studentPromotion", "teacherandClassmanagement", "schoolstaff",
    "assignedClasses"
)

Write-Host "--- Copying LWC Components ---"
foreach ($lwc in $LwcList) {
    if (Test-Path "force-app/main/default/lwc/$lwc") {
        Copy-Item -Path "force-app/main/default/lwc/$lwc" -Destination "$TargetDir/lwc/" -Recurse -Force
        Write-Host "Copied LWC: $lwc"
    }
}


# 2. List of Apex Classes to move (Dependencies)
$ApexList = @(
    "AdmissionController", "StudentController", "MarksheetController", "ClassManagementController",
    "AddFeesController", "ComplaintBox", "ExpenseController", "SchoolStaffController",
    "AttendanceReportController", "AttendanceController", "EduProDashboardController", "GradesController",
    "EnterMarksController", "SchoolSetupController", "NamespaceUtils", "TestDataFactory", "PromotionController",
    "AcademicYearTriggerTest", "PricebookAutomationHandler", "AdmissionInvoiceController", "InvoicePDFController"
)

Write-Host "`n--- Copying Apex Controllers ---"
foreach ($cls in $ApexList) {
    if (Test-Path "force-app/main/default/classes/$cls.cls") {
        Copy-Item -Path "force-app/main/default/classes/$cls.cls" -Destination "$TargetDir/classes/" -Force
        Copy-Item -Path "force-app/main/default/classes/$cls.cls-meta.xml" -Destination "$TargetDir/classes/" -Force
        Write-Host "Copied Apex Class: $cls"
    }
    if (Test-Path "force-app/main/default/classes/$($cls)Test.cls") {
         Copy-Item -Path "force-app/main/default/classes/$($cls)Test.cls" -Destination "$TargetDir/classes/" -Force
         Copy-Item -Path "force-app/main/default/classes/$($cls)Test.cls-meta.xml" -Destination "$TargetDir/classes/" -Force
         Write-Host "Copied Test Class: $($cls)Test"
    }
}


Write-Host "`n--- Copying Applications, Tabs, Permission Sets, and Layouts ---"
$folders = @("applications", "tabs", "permissionsets", "staticresources", "objects", "flexipages", "layouts", "triggers", "pages", "standardValueSets")
foreach ($f in $folders) {
    if (Test-Path "force-app/main/default/$f") {
        Copy-Item -Path "force-app/main/default/$f" -Destination "$TargetDir" -Recurse -Force
        Write-Host "Copied $f directory."
    }
}


Write-Host "`n--- Cleaning up Unwanted Metadata causing build failures ---"
if (Test-Path "packaged-src\main\default\objects\Product2\fields\UnitOfMeasureId.field-meta.xml") {
    Remove-Item "packaged-src\main\default\objects\Product2\fields\UnitOfMeasureId.field-meta.xml" -Force
}
if (Test-Path "packaged-src\main\default\objects\Pricebook2\fields\CostBookId.field-meta.xml") {
    Remove-Item "packaged-src\main\default\objects\Pricebook2\fields\CostBookId.field-meta.xml" -Force
}

# Cleanup folders (applications, permissionsets)
$cleanupFolders = @("applications", "permissionsets")
foreach ($folder in $cleanupFolders) {
    $dirPath = "packaged-src\main\default\$folder"
    if (Test-Path $dirPath) {
        $files = Get-ChildItem $dirPath -File | Where-Object { $_.Name -match "standard__" -or $_.Name -match "sfdcInternalInt__" }
        foreach ($f in $files) {
            Remove-Item $f.FullName -Force
            Write-Host "Deleted App/PermSet casing error: $($f.Name)"
        }
    }
}

Write-Host "`n--- Cleaning up Permission Sets XML ---"
if (Test-Path "packaged-src\main\default\permissionsets") {
    $permsets = Get-ChildItem "packaged-src\main\default\permissionsets" -Filter "*.permissionset-meta.xml" -File
    foreach ($ps in $permsets) {
        [xml]$xml = Get-Content $ps.FullName
        $root = $xml.PermissionSet
        $nodesToRemove = @()
        if ($root) {
            foreach ($ca in $root.classAccesses) {
                $className = $ca.apexClass
                if ($className -and (-not (Test-Path "packaged-src\main\default\classes\$className.cls"))) {
                    $nodesToRemove += $ca
                    Write-Host "Removing missing Class access from $($ps.Name): $className"
                }
            }
            foreach ($na in $nodesToRemove) {
                [void]$root.RemoveChild($na)
            }
            $xml.Save($ps.FullName)
        }
    }
}

Write-Host "`nDone!"
