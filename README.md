![Safety@Work header](/documentation/images/header.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Table of contents
=================

<!--ts-->
- [Table of contents](#table-of-contents)
- [Prerequisites for deploy](#prerequisites-for-deploy)
  - [SCP Subaccount assignment](#scp-subaccount-assignment)
- [Deployment](#deployment)
  - [WebIDE](#webide)
  - [Cloud Foundry CLI](#cloud-foundry-cli)
  - [Post-deployment checks](#post-deployment-checks)
- [The Data Model](#the-data-model)
  - [Entites and Relations](#entites-and-relations)
  - [DB Functions](#db-functions)
  - [Views](#views)
- [The Services Layer](#the-services-layer)
  - [OData service](#odata-service)
  - [XSJS services](#xsjs-services)
    - [Function **checkInfection**](#function-checkinfection)
    - [Function **importEvents**](#function-importevents)
    - [Function **insertEIDs**](#function-inserteids)
    - [Function **insertInfected**](#function-insertinfected)
  - [License](#license)
<!--te-->

Prerequisites for deploy
========================
This section shows all the necessary details needed to setup SCP subaccount and deployment system. To deploy the application two options are available:
1. **SAP Web IDE** - deploy the app directly from SCP editor;
2. **Cloud Foundry CLI** - onPrem build & deploy of the MTA application.

## SCP Subaccount assignment
Below are listed SCP services & entitlements that must be available within SCP Cloud Foundry subaccount in order to support application deployment & execution.

Service     | Plan              | Quantity
---------   | ---------------   | -----
**Application Runtime** | MEMORY | 3 GB
**HTML5 Applications** | app-host | 6 MB
**Mobile Services** | standard | Total nr of users using the mobile app
**Portal** | standard | --
**SAP HANA Service** or **Cloud** | GBSTANDARD or hana | minimum quantity
**SAP HANA Schemas & HDI Containers** | hdi-shared | --

Deployment
==========

Both deployment method are equivalent. The choice depends on skills and decision taken by the developer/system administrator.

## WebIDE
It is necessary to activate a WebIDE service within a NEO subaccount to perform following step. To do that, following entitlement should be in place

Service     | Plan              | Quantity
---------   | ---------------   | -----
**Web IDE** | users | 1

Everything begin by **cloning this repository** into WebIDE workspace. First step is to get the repo URL from the top right green `Clone or download` button of this page: by clicking on it, a popup allow you to copy the Repo URL

![GitHub Clone or download button](/documentation/images/d01_github_repo.png)

Once got the URL:
1. logon to your WebIDE application
2. right click the `workspace root folder`
3. select `Git > Clone Repository` 

![WebIDE Git > Clone repository](/documentation/images/d02_webide_clone.png)

In the upcoming window, paste the URL you've just copied and hit the `Clone` button.

![WebIDE Paste repo URL and Clone](/documentation/images/d03_webide_git_url_and_clone.png)

Wait few seconds and then a new project will be available within your WebIDE workspace as shown in following picture.

![WebIDE clone results](/documentation/images/d04_webide_project_structure.png)

After cloning the project from GitHub repository into the development tool, first of all the project must be **built using Cloud MTA Build tool**

![WebIDE Deployment MTA Build](/documentation/images/01_mta_build_tool_webide.png)

Once the process is successfully completed, console should look like as follow:

![WebIDE Deployment MTA Build success in console](/documentation/images/02_mtb_build_success.png)

The project folders should contain also newly created **mta_archives** with the mtar inside it:

![WebIDE Deployment MTA Build success in console](/documentation/images/03_mtb_build_success_project.png)

Final step is to proceed with deployment of the MTAr, directly from *covid19-contact-tracing-be_1.0.0.mtar* context menu, as depicted in following image:

![WebIDE Deployment MTA Build success in console](/documentation/images/04_deploy_mtar_webide.png)

Once the process is finished, a message saying `Process finished`.

## Cloud Foundry CLI
Before proceeding with build & deployment steps it is necessary to perform following steps to install Cloud Foundry CLI and necessary plugins:
1. [Install Cloud Foundry Command-Line Interface (CLI)](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html);
2. [Install the MultiApps Cloud Foundry CLI Plugin](https://developers.sap.com/tutorials/cp-cf-install-cliplugin-mta.html);
3. [Install NodeJS version 10.xx](https://nodejs.org/en/download/) and [Cloud MTA Build Tool](https://sap.github.io/cloud-mta-build-tool/download/);
4. (Optional) Install [CF HTML5 Applications Repository CLI Plugin](https://github.com/SAP/cf-html5-apps-repo-cli-plugin) - it is needed to monitor HTML5 Repository service within SCP CF Subaccount.

After cloning the repository, access the root folder of the project and start building the project with command

```bash
$ mbt build
```

Once the process is completed, following message should appear in the console:

![CF CLI MBT Build command success](/documentation/images/05_cf_cli_build.png)

Next step is to login to your SCP CF Organization and Space. To do that, use following command in CLI:

```bash
$ cf login
```

After answering all prompted questions, you should be logged in the system and Console's output should look like as follow:

![CF CLI login procedure](/documentation/images/06_cf_login.png)

Then move into `mta_archives` folder and start deployment of the application with following command:

```bash
$ cf deploy covid19-contact-tracing-be_1.0.0.mtar --version-rule ALL --delete-services
```

After the process has been successfully terminated, console should contain following line

![CF Deploy success](/documentation/images/07_cf_deploy_ok.png)

This URL points to Safety @ Work back-office applications approuter (see next sections).

## Post-deployment checks
Log into your SCP Cloud Foundry subaccount and navigate the `Applications` section of the target Space inside your Organization. As a result of a successful deployment, you should be able to see following apps:

![CF Space Applications](/documentation/images/08_space_applications.png)

Inside the `cv19-tracing-approuter` application overview page, you can find link to the central Launchpad of all the back-office apps available within the system:

![CF Approuter overvie page](/documentation/images/09_approuter_overview.png)

By clicking the `Application Routes` link, Fiori Launchpad application is shown displaying all back-office apps:

![Safety @ Work Fiori Launchpad with applications](/documentation/images/10_flp_apps.png)



# The Data Model
The application data model is made by both classical DB tables and DB views. All the artifacts are store in the module with name **cv19-tracing-db**. The implementation follows the guideline of using HANA development infrastructure to create a corresponding HANA container. See in the following paragraphs all the details
## Entites and Relations

>### **Device:**
>this table contains all the devices onboarded by either the application (i.e. a phone) or a beacon (i.e. a room's beacon)
 >- *DeviceID (key)*: String 100
 >- Type: String 50 (Enum USER, BEACON)
 >- Description: String 200
 >- OwnedBy: String 100 (auto referencing foreing key) --> *used to track any relations (parent->child) between devices*
 >- CreatedAt: DateTime
 >- CreatetBy: String 100
 >- MofidiedAt: DateTime
 >- MofidiedBy: String 100 
 >- Capacity: Integer --> *in case the device is assigned to a room, this properties is the rooms full capacity. This value will be used to compute occupation KPI*
 >- Major: String 5 --> *contains any value between 0 and 65535 to setup to identify a beacon*
 >- Minor: String 5 --> *contains any value between 0 and 65535 to setup to identify a beacon*
>> **Table Relations:**
>> - 1:N [EphemeralID](#ephemeralid)
>> - 1:N [Infected](#infected)
>> - N:M [Tag](#tag) via table<br>
>> **Device_Tag**
>>      - DeviceID(key): String 100
>>      - TagKey(key):  String 100

>### **EphemeralID:**
>this table contains all the ephemeral IDs (EIDs) generated by a device
>- EID (key) : String 50 --> *in case of a BEACON this will be equals to its *
>- DeviceID: String 100
>- CreatedAt: DateTime
>> **Table Relations:**
>> - 1:1 [Device](#device)

>### **Events:**
>this table contains all events detected by the application. Events can be both two or more persons meeting each other and a becon detection, that means, for example, the device is entered into the beacon's room
>- CreatedAt (key): DateTime --> *event date and time*
>- SourceEID (key): String 16 --> *person's phone EID assigned to the device when the event was detected*
>- TagertIED (key): String 16 --> *can be either BEACON's DeviceID, in case a persons enters a room, or phone's EID of the person met*
>- Distance: float --> *distance detected between two devices*
>> **Table Relations:**
>> - 1:1 [Device](#device)
>> - 1:1 [EphemeralID](#ephemeralid)

>### **Infected:**
>this table contains all DeviceID owned by users whom notified their official positivity to the virus. 
>
	>- ID (key): UUID (String 32) --> *auto generated by the xsjs code which manages record creation*
	>- DeviceID: String 100
	>- CreatedAt: DateTime 
	>- Attrib1 String 200 --> *generic attribute to store data*
	>- Attrib2 String 200 --> *generic attribute to store data*
	>- Attrib3 String 200 --> *generic attribute to store data*
	>- Notes String 2000
>
>> **Table Relations:**
>> - 1:1 [Device](#device)
>> - 1:1 [EphemeralIDInfected](#ephemeralidinfected)

>### **EphemeralIDInfected:**
>this table contains all the EIDs assigned to the device declared as infected
	>- EID (key): String 50
	>- InfectedID (key):  String 32
>> **Table Relations:**
>> - 1:1 [EphemeralID](#ephemeralid)
>> - 1:1 [Infected](#infected)

>### **ProximityDetected:**
>this table collects all the EIDs owned by the device declared as infected which have a match with one or more TargetEID available in table event. This means that in a certain point in time a person declared positive met someone else, so there's a possible risk of infection
	>- CreatedAt (key): DateTime
	>- EIDInfected (key): String(50)
    >- EIDMatched (key): String(50)
    >- EventTS (key): Datetime
>> **Table Relations:**
>> - 1:1 [EphemeralID](#ephemeralid)

>### **Tag:**
>this table collects all tags assigned to devices to manage their categorization
	>- Key(key): String 100
	>- Type:  String 100
    >- Value:  String 100
>> **Table Relations:**
>> - N:M [Device](#device) via table<br>
>> **Device_Tag**
>>      - DeviceID(key): String 100
>>      - TagKey(key):  String 100

## DB Functions
>### **GetMainRequests:**
>this table function extracts all the [devices table](#device)'s fields, plus an additional one which contains concatenation of all tag keys assigned the them <br><br>
> Extracted fields
    >- *DeviceID (key)*: String 100
	>- Type: String 50 (Enum USER, BEACON)
	>- Description: String 200
	>- OwnedBy: String 100 (auto referencing foreing key) --> *used to track any relations (parent->child) between devices*
	>- CreatedAt: DateTime
	>- CreatetBy: String 100
	>- MofidiedAt: DateTime
	>- MofidiedBy: String 100
	>- Capacity: Integer
    >- TagsString: String 2000

## Views
Aim of these view is to create the data layer for evaluate the rooms oocupation KPI. The data baseline are the Devices, EphemeralId and Events table. 
>### **HANA Calculation View CV_AGGREGATE_DEVICE_EVENTS:**
>this CV extracts all the devices data, of type BEACON, and add a counter column which count how many events the device is assigned to. As data source it takes the DB fuction, the table EphemeralId and Event <br><br>
>**Declared Columns:**
>
>![CV_AGGREGATE_DEVICE_EVENTS_Cols](/documentation/images/CV_AGGREGATE_DEVICE_EVENTS_Cols.png)<br><br>
>**Declared Filters:**
>
>![CV_AGGREGATE_DEVICE_EVENTS_Filters](/documentation/images/CV_AGGREGATE_DEVICE_EVENTS_Filters.png)

>### **HANA Calculation View CV_MONITOR_REALTIME:**
>this CV gets the records from [CV_AGGREGATE_DEVICE_EVENTS](#hana-calculation-view-cv_aggregate_device_events) and add a column called MeasuredPercentage which computes the ratio between the room occupation and its full capacity. The occupation is equal to the number of events collected in a certain amount of time. This amount of time is provided by a CV parameter called TimeFrameInMinutes. For example, if the parameter value is 5, the CV counts for all events collected in the past 5 minutes for all the BEACON devices and for each of them computes the occupation ratio <br><br>
>**Declared Columns:**
>
>![CV_MONITOR_REALTIME](/documentation/images/CV_MONITOR_REALTIME.png)
>
>**Declared Params:**
>
>![CV_MONITOR_REALTIME_Params](/documentation/images/CV_MONITOR_REALTIME_Params.png)
>
>**Declared Filters:**
>
>![CV_MONITOR_REALTIME_Filters](/documentation/images/CV_MONITOR_REALTIME_Filters.png)

>### **DB View covid19.V_ROOMSHISTORYOCCUPATION:**
>this DB view gets the records from [CV_AGGREGATE_DEVICE_EVENTS](#hana-calculation-view-cv_aggregate_device_events) and split the events creation timestamp in goups of 5 minutes. For each one of those groups counts how many events were caught by every device. In this way the view provides how many persons occupied a room in slots of 5 minutes of time <br><br>
>
>**Declared Columns:**
>
>![V_ROOMSHISTORYOCCUPATION_Cols](/documentation/images/V_ROOMSHISTORYOCCUPATION_cols.png)

>### **DB View covid19.V_DEVICEUSER:**
>this DB view gets the records from [Device](#device) table extracting just the properties DeviceID and Descriotion of the devices of type USER. This view is for the purpose of showing a value help in the DeviceID field during the Infected creation process<br><br>
>
>**Declared Columns:**
>
>![V_DEVICEUSER_Cols](/documentation/images/V_DEVICEUSER_Cols.png)

>
>### **HANA Calculation View CV_HISTORY_MONITOR:**
>this CV gets the records from [V_ROOMSHISTORYOCCUPATION](#db-view-covid19.v_roomshistoryoccupation) and add a column called Avg, which computes the average amount of room occupation in the time slots provided by the DB view. Moreover, for every returned record provides a String field called TimeFrame. This field returns a string that represents the hour of the day when the Avg value is computed. 
The CV expects to have 2 parameters (shown below) that define the time window when to perform the analisys. The parameters define the start and the end date/time of the window.
Expected table results could be:<br><br>
>
>| DeviceID | Description | TimeFrame | Avg |
>|--- | --- | --- | --- |
>Room1 | lorem ipsum | 8 - 9 | 3.5
>Room1 | lorem ipsum | 9 - 10 | 1
>Room1 | lorem ipsum | 10 - 11 | 6
>Room1 | lorem ipsum | 16 - 17 | 4
>Room2 | dolor sit amet | 8 - 9 | 2.5
>Room2 | dolor sit amet | 10 - 11 | 5
>Room2 | dolor sit amet | 13 - 14 | 3
>
>**Declared Columns:**
>
>![CV_MONITOR_REALTIME](/documentation/images/CV_HISTORY_MONITOR_cols.png)
>
>**Declared Params:**
>
>![CV_MONITOR_REALTIME_Params1](/documentation/images/CV_HISTORY_MONITOR_Params1.png)
>![CV_MONITOR_REALTIME_Params1](/documentation/images/CV_HISTORY_MONITOR_Params2.png)
>
>**Declared Filters:**
>
>![CV_MONITOR_REALTIME_Filters](/documentation/images/CV_HISTORY_MONITOR_Filters.png)
>
>**Calculated Columns:**
>![CV_MONITOR_REALTIME_Filters](/documentation/images/CV_HISTORY_MONITOR_CalcCol.png)

# The Services Layer
The service layer is fully implemented using a node module with xsjs package. Module name is **cv19-tracing-xsjs**.
The services exposed are of OData type and pure XSJS. For some OData entities we have overridden the standard records update behavior.
## OData service
The xsodata file is stored in the folder **/lib/odata** and the file is named **services.xsodata**.
All the code that overrides the standard operations is stores in file **/lib/commons/libs/odataExits.xsjslib**. In this file there are multiple functions named with a common path like **tablename_operation** <br>
Entites exposed are:
- *"demo.sap.presales.covid19.model::covid19.Device" as "DeviceSet"*: it exposes the Device table and has **create, update, delete** operation overridden with xsjs modules. It supports navigation to itself, to get all childern of a device, to EphemeralID table to get all the EIDs assigned and to Infected table to get all the infected related records.<br>
Functions overridden are:
  - *create function*: consider this as the function which performs the device on boarding. It stores the provided device data in the corresponding table. In addition, if the device is of type BEACON stores the device ID in the EphimeralID table 
  - *update function*: this simply update the corresponding device record
  -  *delete function*: this simply delete the corresponding device record. Physical delete is implemented, the function can be consider as an extention point for overriding the delete behavior
- *"demo.sap.presales.covid19.model::covid19.EphemeralID" as "EphemeralIDSet"*: it exposes the EphemeralID table. It supports navigation to Device table to get the related Device data
- *"demo.sap.presales.covid19.model::covid19.Event" as "EventSet"*: it exposes the Event table 
- *"demo.sap.presales.covid19.model::covid19.Infected" as "InfectedSet"*: it exposes the Infected table and has **create** operation overridden with xsjs modules. It supports navigation to Device table, to get the device assigned to the record, to EphemeralIDInfected table to get all the EIDs assigned to the infected device.<br>
Functions overridden are:
  - *create function*: saves an infected record, plus moves the EID assigned to the corresponding device in the EphemeralIDInfected table and moves any event table records, where the extracted EIDs are the target ones
- *"demo.sap.presales.covid19.model::covid19.EphemeralIDInfected" as "EphemeralIDInfectedSet"*: it exposes the EphemeralIDInfected table. It supports navigation to ProximityDetected table to get all the records of the EIDs of possible infected devices
- *"demo.sap.presales.covid19.model::covid19.ProximityDetected" as "ProximityDetectedSet"*: it exposes the ProximityDetected table. It supports navigation to EphemeralIDSet table to get corresponding record of a certain matched EID
- *"demo.sap.presales.covid19.model::covid19.Tag" as "TagSet"*: it exposes the Tag table
- *"demo.sap.presales.covid19.cv::CV_MONITOR_REALTIME" as "RealTimeRoomStatus"*: it exposes the calculation view CV_MONITOR_REALTIME. It supports navigation to Tag table to get corresponding tags assigned to a device
- *"demo.sap.presales.covid19.cv::CV_HISTORY_MONITOR" as "HistoryDevicesStatus"*: it exposes the calculation view CV_HISTORY_MONITOR
- *"demo.sap.presales.covid19.model::covid19.V_DEVICEUSER" as "DeviceUserViewSet"*: it exposes the DB view V_DEVICEUSER
## XSJS services
These services are implemented using XSJS coding language. The backend layer exposes 4 different services with different purposes (see details below). All those services are available via a single HTTP end point and the execution of the different functions is steered by the provided JSON payload. The HTTP end point is implemented in the file **/lib/xsjs/functions.xsjs**. The code imports 4 xsjs libraries to execute the corresponding requested functions. The libraries are store in the path **/lib/commons/libs** and library name match with function name.<br>
The structure of the generic HTTP end point is as follow:<br><br>
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **INPUT**:
```
{
    function: "fnName",
    payload: {
        param1: ...,
        param2: ...
    }
 }
 ```
- **OUTPUT**:
```
{
        "function": "fnName",
        value: {
              returned value
        }
}
```
- **ERROR**:
```
{
        error: {
            code: "500",
            message: "messageText",
            stack: "stackTrace"
        }
}
```
- **COMMON ERRORS**:

*No http body provided*
```
{
  "error": {
    "code": "500",
    "message": "Missing BODY",
    "stack": "Error: Missing BODY\n    at fnHandlePost (/home/vcap/app/lib/xsjs/functions.xsjs:14:11)\n    at /home/vcap/app/lib/xsjs/functions.xsjs:64:37\n    at Script.runInContext (vm.js:133:20)\n    at Runtime._runScript (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/runtime.js:125:10)\n    at Runtime.runXsjs (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/runtime.js:106:15)\n    at xsjsHandler (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/routes.js:18:10)\n    at Layer.handle [as handle_request] (/home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/express/lib/router/layer.js:95:5)\n    at next (/home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/express/lib/router/route.js:137:13)\n    at /home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/@sap/fibrous/lib/fibrous.js:186:18"
  }
}
```
*No function name to execute provided*
```
{
  "error": {
    "code": "500",
    "message": "please provide a function name",
    "stack": "Error: please provide a function name\n    at fnHandlePost (/home/vcap/app/lib/xsjs/functions.xsjs:37:11)\n    at /home/vcap/app/lib/xsjs/functions.xsjs:64:37\n    at Script.runInContext (vm.js:133:20)\n    at Runtime._runScript (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/runtime.js:125:10)\n    at Runtime.runXsjs (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/runtime.js:106:15)\n    at xsjsHandler (/home/vcap/deps/0/node_modules/@sap/xsjs/lib/routes.js:18:10)\n    at Layer.handle [as handle_request] (/home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/express/lib/router/layer.js:95:5)\n    at next (/home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/express/lib/router/route.js:137:13)\n    at /home/vcap/deps/0/node_modules/@sap/xsjs/node_modules/@sap/fibrous/lib/fibrous.js:186:18"
  }
}
```
### Function **checkInfection**
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **DESCRIPTION**: given a deviceID, it checks whether there's at least one record, in table **ProximityDetected**, where field EIDMatched contains an EID assigned to the provided corresponding device
- **INPUT**:
```
{
    function: "checkInfection",    
   "payload" : {
        "deviceId": "sDeviceID", <-- mandatory
    }
 }
 ```
- **OUTPUT**:
```
{
  "function": "checkInfection",
  "value": {
    "meetInfected": true
  }
}
```

### Function **importEvents**
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **DESCRIPTION**: given an array of events to import, it stores their data in the corresponding **Event** table
- **INPUT**:
```
{    
"function": "importEvents",
    "payload" : {
        "events": [
            {"CreatedAt":dDate,"Distance":iDistance,"SourceEID":"sValue","TargetIED":"sValue"},
            {"CreatedAt":dDate,"Distance":iDistance,"SourceEID":"sValue","TargetIED":"sValue"},
            ...
        ]
    }
}
 ```
- **OUTPUT**: skippedRecords is an array containing all those event records either that don't have at least one of the property CreatedAt, SourceEID, TargetIED or one of those properties value is null.
```
{
    "function": "importEvents",
    "value": {
        "countImportedEvents": iCount,
        "skippedRecords": [
            {
                "CreatedAt": value
                "Distance": value,
                "SourceEI": value
                "TargetIED": null
            }
        ]
    }
}
```
- **ERRORS**:
*in case of an empty input events array returns the message: "Missing events to import"*
### Function **insertEIDs**
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **DESCRIPTION**: given an array of EID to import, it stores their data in the corresponding **EphemeralID** table
- **INPUT**:
```
{    
"function": "insertEIDs",
    "payload" : {
        "events": [
            {"CreatedAt":dDate,"EID":"sValue","DeviceID":"sValue"},
            {"CreatedAt":dDate,"EID":"sValue","DeviceID":"sValue"},
            ...
        ]
    }
}
 ```
- **OUTPUT**: skipped records is an array containing all those event records either that don't have at least one of the property CreatedAt, EID, DeviceID or one of those properties value is null. Moreover, it contains those records not inserted due to a unique key constraint violation
```
{
    "function": "insertEIDs",
    "value": {
        "countImportedEvents": iCount,
        "skippedRecords": [
            {
                "CreatedAt": value
                "EID": value
                "DeviceID": null
            }
        ]
    }
}
```
- **ERRORS**:
*in case of an empty input EIDs array returns the message: "Missing EIDs to import"*
### Function **insertInfected**
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **DESCRIPTION**: see the description of the function which overrides **Infected** table records creation in the OData service paragraph
- **INPUT**:
```
{
    "function": "insertInfected",    
   "payload" : {
        "deviceId": "sDeviceID", <-- mandatory
        "distance": iDistance,
        "attrib1": "sValue",
        "attrib2": "sValue",
        "attrib3": "sValue",
        "notes": "sValue"
    }
}
 ```
- **OUTPUT**: skipped records is an array containing all those event records either that don't have at least one of the property CreatedAt, EID, DeviceID or one of those properties value is null. Moreover, it contains those records not inserted due to a unique key constraint violation
```
{
  "function": "insertInfected",
  "value": {
    "countPotentialInfectedDevices": iCounter
  }
}
```
- **ERRORS**:
  - *in case of an empty deviceID returns the message: Missing device ID parameter*
  - *in case distance parameter is not of a number returns the message: Provided distance value is not a number. Please send a number*
  
## License
License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
