![](https://img.shields.io/badge/STATUS-NOT%20CURRENTLY%20MAINTAINED-red.svg?longCache=true&style=flat)

![Safety@Work header](/documentation/images/header.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/safety-at-work-mta)](https://api.reuse.software/info/github.com/SAP-samples/safety-at-work-mta)

Table of contents
=================

<!--ts-->
- [Table of contents](#table-of-contents)
- [Prerequisites for deploy](#prerequisites-for-deploy)
  - [BTP Subaccount assignment](#btp-subaccount-assignment)
- [Deployment](#deployment)
  - [WebIDE](#webide)
  - [Cloud Foundry CLI](#cloud-foundry-cli)
  - [Post-deployment checks](#post-deployment-checks)
  - [Post-deployment configurations](#post-deployment-configurations)
    - [Email destination configuration](#email-destination-configuration)
    - [XSJS destination configuration](#xsjs-destination-configuration)
    - [Approver attribute assignment](#approver-attribute-assignment)
- [Data Model](#data-model)
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
    - [Function **setApprovalStatus**](#function-setapprovalstatus)
- [Approval Workflow (BTP Workflow service)](#approval-workflow-btp-workflow-service)
- [UI Applications](#ui-applications)
- [License](#license)
<!--te-->

Prerequisites for deploy
========================
This section shows all the necessary details needed to setup BTP subaccount and deployment system. To deploy the application two options are available:
1. **SAP Web IDE** - deploy the app directly from BTP editor;
2. **Cloud Foundry CLI** - onPrem build & deploy of the MTA application.

## BTP Subaccount assignment
Below are listed BTP services & entitlements that must be available within BTP Cloud Foundry subaccount in order to support application deployment & execution.

Service     | Plan              | Quantity
---------   | ---------------   | -----
**Cloud Foundry Runtime** | MEMORY | 4 GB
**HTML5 Applications** | app-host | 10 MB
**SAP Mobile Services** | standard | Total nr of users using the mobile app
**Launchpad Service** | standard | --
**SAP HANA Service** or **Cloud** | GBSTANDARD or hana | minimum quantity
**SAP HANA Schemas & HDI Containers** | hdi-shared | --
**Workflow Management Service** | standard | --

Prerequisites setup process includes following actions that must be performed to properly setup the Cloud Foundry environment:

  1. Setup **Subaccount** + **Cloud Foundry Organization** and **Space**. To do this, have a look at [Getting Started with an Enterprise Account in the Cloud Foundry Environment](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/56440ab2380041e092c29baf2893ef97.html) section of SAP Help portal;
   
  2. Setup the **Mobile Services** tenant in the newly created BTP Cloud Foundry space. Have a look at [Mobile Services setup page](https://help.sap.com/viewer/468990a67780424a9e66eb096d4345bb/Cloud/en-US/d2a9afc1681c4e57a4a0f2039274d250.html) in SAP Help portal;

  3. If the HANA service is not instantiated into the same space where you're about to deploy the application, it is necessary to create an **Instance Sharing** configuration within the SAP HANA Service Dashboard. To do so, follow the [Share a Database with Other Spaces](https://help.sap.com/viewer/cc53ad464a57404b8d453bbadbc81ceb/Cloud/en-US/390b47b7c0314d57a1829a0759a71ace.html) section of SAP Help Portal.


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
4. (Optional) Install [CF HTML5 Applications Repository CLI Plugin](https://github.com/SAP/cf-html5-apps-repo-cli-plugin) - it is needed to monitor HTML5 Repository service within BTP CF Subaccount.

After cloning the repository, access the root folder of the project and start building the project with command

```bash
$ mbt build
```

Once the process is completed, following message should appear in the console:

![CF CLI MBT Build command success](/documentation/images/05_cf_cli_build.png)

Next step is to login to your BTP CF Organization and Space. To do that, use following command in CLI:

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
Log into your BTP Cloud Foundry subaccount and navigate the `Applications` section of the target Space inside your Organization. As a result of a successful deployment, you should be able to see following apps:

![CF Space Applications](/documentation/images/08_space_applications.png)

Inside the `cv19-tracing-approuter` application overview page, you can find link to the central Launchpad of all the back-office apps available within the system:

![CF Approuter overvie page](/documentation/images/09_approuter_overview.png)

By clicking the `Application Routes` link, Fiori Launchpad application is shown displaying all back-office apps:

![Safety @ Work Fiori Launchpad with applications](/documentation/images/10_flp_apps.png)

## Post-deployment configurations

In order to let the **Workflow** works properly, we need to setup following **destinations** within BTP subaccount

### Email destination configuration

In order to allow Workflow service to send email to approvers, it is necessary to setup a destination that points to the SMTP server of the company.

**NB:** SMTP server must adhere to a set of specification in order to be configurable within the destination. Refer [Configure the Workflow Service Mail Destination](https://help.sap.com/viewer/e157c391253b4ecd93647bf232d18a83/Cloud/en-US/45220d841c704a4c8ac78618207ee103.html) for further details.

Here's an example code snippet that can be used as a guide to properly create email destination. You can copy-paste it into a file (saved without file extension), fill the missingi fields (marked with **< ... >** chars) and import it directly within destination page of the subaccount.

```
Type=MAIL

Name=bpmworkflowruntime_mail

mail.user=<smtp_user>
mail.password=<smtp_password>

mail.smtp.host=<smtp_host>
mail.smtp.port=587
mail.transport.protocol=smtp
mail.smtp.starttls.required=true
mail.smtp.starttls.enable=true
mail.smtp.auth=true

mail.smtp.ssl.trust=*

mail.smtp.from=<email_address_to_put_in_from>
mail.smtp.ssl.checkserveridentity=true

mail.bpm.send.disabled=false
```

The final result should look like as follow:

![WF email destination](/documentation/images/wf_email_destination.png)

---
### XSJS destination configuration

The Workflow requires an additional destination to be able to communicate with Safety@Work business logic - exposed through XSJS service - in order to change also in back-end tasks approval status.

First of all it is necessary to access the **cv19-tracing-xsjs** service overview page, and from there the "Service Binding" section.

![BTP XSJS Service binding section located at](/documentation/images/xsjs_destination_auth_0.png)

From the next page take note of following information from the **sensitive data section** of the **uaa_covid19-contact-tracing-be** bound service:

 1. *clientid*
   
 2. *clentsecret*

 3. *url*

![XSJS UAA service details](/documentation/images/xsjs_destination_auth_1.png)

Switch back to destination configuration within subaccount cockpit and create a new destination using these informations, in order to properly address *cv19-tracing-xsjs* service.

![BTP Destination configuration](/documentation/images/xsjs_destination_auth_2.png)

**NB:** in the Token Service URL you must type the value of "url" field with */oauth/token* appended at the end. Final URL should look like as follow:

`https://yourorganizationid.authentication.yourregion.hana.ondemand.com/oauth/token`

---
### Approver attribute assignment

In order to "inform" the Workflow service about the approver recipient, Safety@Work app grants the possibility to associate an approver email address to a specific role. 

To do that it is necessary to access one of the deployed app - e.g. **cv19-tracing-approuter** - and then access the *Roles* section [1]. Inside it, it is necessary to create a new Role [2] in order to specify the approver's email approver.

![CV19 tracing Roles section](/documentation/images/approver_role_1.png)

In upcoming wizard steps insert:
 - *Role Name* - a generic name that allows you to recognize the new role (e.g. the name of the team that an user is part of);
  
 - *Description* - free text that describe the aim of the new role;
  
 - Role Template - pick *END_USER* from the drop down list.

![Role configuration wizard step 1](/documentation/images/approver_role_2.png)

In the step #2 specify in the *Values* field the email address of the approver associated to the role.

**NB:** be sure to insert only one email address.

Once you've done, hit enter key and a new tag will be added in the attibute field.

![Role configuration wizard step 2](/documentation/images/approver_role_3.png)

Step #3 allows you to assign the role to a *Role Collection* (in case it already exists). This step can be skipped and postponed after role is created.

In step #4 review all data and click *Finish* button to save the new Role.

![Role configuration wizard step 4](/documentation/images/approver_role_4.png)

Last step is to assign this role - if not already done - to a Role Collection and, subsequently, assign the Role Collection to users.
Please refer to [Maintain Role Collections](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/d5f1612d8230448bb6c02a7d9c8ac0d1.html) of SAP Help portal.

Here's an example of new Role Collection created within the account assigned to basic users.

**NB:** the newly created Role Collection must include also *WorkflowParticipant* Workflow's standard roles to grant the apps the possibility to trigger the service properly.

![SafetyAtWork generic user Role Collection](/documentation/images/wf_rc_user.png)

This Role Collection **must** be assigned to all the users that will use the app.

# Data Model
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

>### **Reservation:**
>this table contains all the reservation sent to the system for booking both rooms and slot in an area (for example a parking lot). 
>
	>- ID (key): Bigint --> *auto generated by HANA*
	>- Subject: String 200 (not null)
	>- DateStart: DateTime
  >- DateEnd: DateTime 
  >- PartecipantsNumber: Integer
  >- Notes String 2000
	>- RoomID String 100 
	>- EmployeeID String 200 
	>- ApprovalStatus TinyInt --> *enum 0 to be approved, 1 approved, 2 rejected*
	
>
>> **Table Relations:**
>> - 1:1 [Device](#device) via RoomID
>> - 1:1 [Device](#device) via EmployeeID

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

>### **HANA Calculation View CV_AREA_OCCUPATION_BY_DATE:**
>this CV provides the value of occupation for area id provided as input value. This values are grouped by date in the time window defined by input parameters start and end date  <br><br>
>**Declared Columns:**
>
>![CV_AREA_OCCUPATION_BY_DATES_Cols](/documentation/images/CV_AREA_OCCUPATION_BY_DATES_Cols.jpg)
>
>**Declared Params:**
>
>![CV_AREA_OCCUPATION_BY_DATES_Params1](/documentation/images/CV_AREA_OCCUPATION_BY_DATES_Params1.jpg)
>
>![CV_AREA_OCCUPATION_BY_DATES_Params2](/documentation/images/CV_AREA_OCCUPATION_BY_DATES_Params2.jpg)
>
>![CV_AREA_OCCUPATION_BY_DATES_Params3](/documentation/images/CV_AREA_OCCUPATION_BY_DATES_Params3.jpg)
>
>**Declared Filters:**
>
>![CV_AREA_OCCUPATION_BY_DATES_filters](/documentation/images/CV_AREA_OCCUPATION_BY_DATES_filters.png)

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

>### **DB View covid19.V_DEVICEAREA:**
>this DB view gets the records from [Device](#device) table extracting devices of type AREA. This view is usefull to populate value helpers, combo boxes, etc to enlist areas available<br><br>
>
>**Declared Columns:**
>
>![V_DEVICEAREA_Cols](/documentation/images/V_DEVICEAREA_Cols.png)
>

>### **DB View covid19.V_DEVICEROOM:**
>this DB view gets the records from [Device](#device) table extracting devices of type BEACON (the rooms). This view is usefull to populate value helpers, combo boxes, etc to enlist rooms available<br><br>
>
>**Declared Columns:**
>
>![V_DEVICEROOM_Cols](/documentation/images/V_DEVICEROOM_Cols.png)
>

>### **DB View covid19.V_DEVICEROOMAREA:**
>this DB view gets the records from [Device](#device) table extracting devices of type BEACON (the rooms) and AREA. This view is usefull to populate value helpers, combo boxes, etc to enlist rooms and areas available<br><br>
>
>**Declared Columns:**
>
>![V_DEVICEROOMAREA_Cols](/documentation/images/V_DEVICEROOMAREA_Cols.png)
>

>### **DB View covid19.V_DEVICERESERVATION:**
>this DB view gets the records from the join between [Device](#device) table and [Reservation](#reservation) table extracting all reservations stored, plus the booked room's data and the employee name <br><br>
>
>**Declared Columns:**
>
>![V_DEVICERESERVATION_Cols](/documentation/images/V_DEVICERESERVATION_Cols.png)


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
- *"demo.sap.presales.covid19.model::covid19.Reservation" as "ReservationSet"*: it exposes the Reservation table
- *"demo.sap.presales.covid19.cv::CV_MONITOR_REALTIME" as "RealTimeRoomStatus"*: it exposes the calculation view CV_MONITOR_REALTIME. It supports navigation to Tag table to get corresponding tags assigned to a device
- *"demo.sap.presales.covid19.cv::CV_HISTORY_MONITOR" as "HistoryDevicesStatus"*: it exposes the calculation view CV_HISTORY_MONITOR
- *"demo.sap.presales.covid19.cv::CV_AREA_OCCUPATION_BY_DATE" as "OccupationByDate"*: it exposes the calculation view CV_AREA_OCCUPATION_BY_DATE
- *"demo.sap.presales.covid19.model::covid19.V_DEVICEUSER" as "DeviceUserViewSet"*: it exposes the DB view V_DEVICEUSER
- *"demo.sap.presales.covid19.model::covid19.V_DEVICEROOMAREA" as "RoomAreaSet"*: it exposes the DB view V_DEVICEROOMAREA
- *"demo.sap.presales.covid19.model::covid19.V_DEVICEROOM" as "RoomSet"*: it exposes the DB view V_DEVICEROOM
- *"demo.sap.presales.covid19.model::covid19.V_DEVICEAREA" as "AreaSet"*: it exposes the DB view V_DEVICEAREA
- *"demo.sap.presales.covid19.model::covid19.V_DEVICERESERVATION" as "RoomReservationSet"*: it exposes the DB view V_DEVICERESERVATION
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

### Function **setApprovalStatus**
- **URL (method POST)**: <xsjs_module_url>/xsjs/functions.xsjs
- **DESCRIPTION**: given a reservation ID and an approval status (values accepted are 0 or 1 or 2) sets the approval status field to the provided value
- **INPUT**:
```
{
    function: "setApprovalStatus",    
   "payload" : {
        "ID": "sReservationID", <-- mandatory
        "ApprovalStatus": "iApprovalStatus" (0, 1, 2) <-- mandatory
        
    }
 }
 ```
- **OUTPUT**:
```
{
    "function": "setApprovalStatus",
    "value": {
        "updatedRecords": 1
    }
}
```
  
Approval Workflow (BTP Workflow service)
========================================

The workflow structure is depicted in following picture:

![Workflow structure](/documentation/images/wf_structure_1.png)

Referring the above picture, here's the description of each step of the Workflow:
1. **Create task link** - Script block that is used to build the link to My Inbox application that will be displayed in the email body (sent to the Approver)

  ```javascript
    var sHash = "#WorkflowTask-DisplayMyInbox?sap-ui-app-id-hint=cross.fnd.fiori.inbox&/detail/NA/{{taskID}}/TaskCollection(SAP__Origin='NA',InstanceID='{{taskID}}')".replace(/{{taskID}}/g, $.info.workflowInstanceId),
	    sMyInboxUrl = [$.context.appRouterUrl,sHash].join("");  // Concatenate appRouter URL (coming from UI) and Generated Hash path
    $.context.mIU = sMyInboxUrl;  // My Inbox URL
  ```
2. **Send creation email** - Email task used to send an email to the approver. Its content is contained in the [WF Approval Email template HTML](/cv19-tracing-wf/webcontent/cv19approvalwf/wf_approval_email_template.html);
   
  ![Workflow Email Task](/documentation/images/wf_structure_2.png)

3. **Apply Decision** - User Task performed by the approver. The Workflow pauses on this step untill the approver has taken its decision about the task sent to him.

  ![Workflow User Task properties](/documentation/images/wf_structure_3.png)

The UI configuration is delegated to an *UI Form* named [reservationRequestForm](/cv19-tracing-wf/forms/cv19approvalwf/reservationRequestForm.form) that has following structure.

  ![Workflow User Task properties](/documentation/images/wf_structure_4.png)

and followign decision options.

  ![Workflow User Task UI Form](/documentation/images/wf_structure_5.png)

4. **Format context data** - Script Task that is used to format all context data that will be necessary for next steps. It creates:
   -  the body of the email sent to the requestor;
   -  the data structure that will be sent to the back-end service.

    ```javascript
    var bApproved = $.usertasks.usertask1.last.decision == "approve",
        oData = {
          backEndStatus: (bApproved) ? 1 : 2,
          emailMessage: (bApproved) ? "Your request has been approved by the manager." : "Unfortunately your request has been rejected.\nPlease call your manager for further details.",
          emailSubject: (bApproved) ? "Reservation request approved" : "Reservation request rejected",
          backendData: {
            hanaUrl: "/xsjs/functions.xsjs",
            requestBody: {
              function: "setApprovalStatus",
              payload: {
                  ApprovalStatus: (bApproved) ? 1 : 2,
                  ID: $.context.r.i
              }
            },
            responseBody: {}
          }
        };
    $.context.cv19Data = oData;
    ```

5. **Update reservation task** - Service Task that calls XSJS back-end function in order to update the Reservation task according to applied decision.

  ![Workflow Service Task properties](/documentation/images/wf_structure_6.png)

6. **Send confirmation email** - Email Task used to inform the user about the decision taken by the approver. The content of email message is contained into [Response email body HTML file](cv19-tracing-wf/webcontent/cv19approvalwf/response_email_body.html).

  ![Workflow Email Task properties](/documentation/images/wf_structure_7.png)

UI Applications
========================

This MTA contains following UI5 applications:

 - **Device** - Fiori Element template-based application, used to manage Devices master data. As explained in the [The Data Model](#the-data-model) section, a Device can be one of USER, BEACON or AREA according to the type of physical "thing" it is referred to (an app user, a meeting room or a bookable area);
  
  ![Device management app](/documentation/images/App01_device_management.png)

 - **Tested Positives** - Fiori Element template-based application, used to register within the cloud system an user as "COVID-19 tested positive", in order to trigger back-end logic necessary to establish the complete exposure contacts graph;
  
  ![Tested positives app](/documentation/images/App02_tested_positives_app.png)
  
 - **Crowd Monitoring** - monitor application used to have both real-time and historical view of crowd levels within each "hot spot" mapped within the system;
  
  ![Crowd Monitoring app](/documentation/images/App03_crowd_monitoring_app.png)

 - **Room Booking** - end user application used to book a meeting room and/or a common space for a group of people (according to its max capacity);
  
  ![Crowd Monitoring app](/documentation/images/App04_room_booking_app.png)

 - **Area Booking** - end user application used to reserve "a spot" within a certain wide area (e.g. Parking lot).

  ![Crowd Monitoring app](/documentation/images/App05_area_booking_app.png)

License
===========
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
