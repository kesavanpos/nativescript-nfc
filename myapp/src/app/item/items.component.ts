import { Component, OnInit } from "@angular/core";
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as application from 'tns-core-modules/application';
import { parseString } from 'nativescript-xml2js';
declare var ae:any;
declare var com:any;
declare var android:any;
import { CardData,ModifiablePublicData,NonModifiablePublicData,HomeAddress,WorkAddress } from "../models/CardData"
import {  AndroidApplication, AndroidActivityBundleEventData, AndroidActivityEventData } from "tns-core-modules/application";

import { Item } from "./item";
import { ItemService } from "./item.service";

@Component({
    selector: "ns-items",
    templateUrl: "./items.component.html"
})
export class ItemsComponent implements OnInit {
    items: Array<Item>;
    private nfc: Nfc;
    publicData:any;
    toolkit:any;
    cardReader:any;
    tag : any;
    cardData:CardData;

    constructor(private itemService: ItemService) {
        this.nfc = new Nfc();

        application.android.on("newintent", (args) => {
            android.widget.Toast.makeText(this, "newintent nativescript", android.widget.Toast.LENGTH_SHORT).show();         
        });

       application.android.on(AndroidApplication.activityResumedEvent, (args: AndroidActivityEventData) => {
            // Does log
            console.log("Event: " + args.eventName + ", Activity: " + args.activity);
            let intent = (args.activity).getIntent();
            console.log("intent value -> " + intent);

            let extras = intent.getExtras();
            if(extras) {
                let extras = args.activity.getIntent().getExtras(); 
            }

            if (!this.nfc) {
                // Gets executed once
                this.nfc = new Nfc();

                // Does log
                this.nfc.available().then((avail) => console.log("NFC is " + (avail ? '' : 'not ') + 'available'));
                // Does log
                this.nfc.enabled().then((isOn) => console.log("NFC is " + (isOn ? '' : 'not ') + 'on'));

                this.nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
                    // Does NOT log
                    this.tag = data;
                    dialogs.alert("setOnNdefDiscoveredListener" +  data).then(()=> {
                        console.log("Dialog closed!");
                    });
                    console.log("Discovered a tag with ID " + data.id);
                }).then(() => {
                    // Does Log
                    console.log("OnTagDiscovered listener added");
                });

                this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
                    // Does NOT log
                    this.tag = data;
                    dialogs.alert("setOnNdefDiscoveredListener" +  data).then(()=> {
                        console.log("Dialog closed!");
                    });
                    console.log("Discovered a tag with ID " + data.id);
                }).then(() => {
                    // Does log
                    console.log("OnNdef listener added");
                });
            }
        });
     }

    ngOnInit(): void {
       this.items = this.itemService.getItems();
    }

   generateRequestID() {          
       try
       {
        let byteArr = Array.create("byte", 40);
        var secureRandom = new java.security.SecureRandom();
        secureRandom.nextBytes(byteArr);       
        let requestId = android.util.Base64.encodeToString(byteArr, android.util.Base64.NO_WRAP);

        dialogs.alert("generateRequestID success : " +  requestId).then(()=> {
            console.log("Dialog closed!");
        });
        
        return requestId;
       }      
       catch(e)
       {
        dialogs.alert("generateRequestID Error " +  e.message).then(()=> {
            console.log("Dialog closed!");
        });
        return "jhN8uvfCapB1dmqKGAVoND38n7sbK1lRXAOOsFN7Tvpde7W5+AK9zg==";
       }
    }

    ShowData(event)
    {
        try
        {
            let test = new com.toolkit.readerapplication.Connector();
            let emp = test.GetEmployee();

            dialogs.alert("ShowData" +  emp).then(()=> {
                console.log("Dialog closed!");
            });

            dialogs.alert("ShowData FirstName" +  emp.FirstName).then(()=> {
                console.log("Dialog closed!");
            });
        }
        catch(e)
        {
            dialogs.alert("ShowData Error" +  e.message).then(()=> {
                console.log("Dialog closed!");
            });
        }
    }

    ShowPublicData(event){

        if(this.toolkit != null && this.cardReader != null)
        {
            try
            {
    
                this.publicData = com.toolkit.readerapplication.Connector.GetPublicData(this.cardReader,application.android.context);            
               
                this.items=[];

                this.AddItems("CardNumber",this.publicData.getCardNumber());
                this.AddItems("IdNumber",this.publicData.getIdNumber());

                this.GetModData();
                this.GetNonModData();
                this.GetHomeAddress();
                this.GetWorkAddress();
    
                dialogs.alert("Records Retrieved Successfully !").then(()=> {
                    console.log("Dialog closed!");
                });
            }
            catch(e)
            {
                dialogs.alert("ShowPublicData Error " +  e.message).then(()=> {
                    console.log("Dialog closed!");
                });
            }
        }
        else if(this.toolkit == null)
        {
            dialogs.alert("Toolkit is null").then(()=> {
                console.log("Dialog closed!");
            });
        }
        else if(this.cardReader == null)
        {
            dialogs.alert("CardReader is null").then(()=> {
                console.log("Dialog closed!");
            });
        }
    }

    AddItems(Entity,EntityValue)
    {
        try
        {
            if(EntityValue != null && EntityValue != undefined)
            this.items.push(
                {
                    id:this.items.length + 1,
                    name:Entity,
                    role:EntityValue
                });
        }
        catch(e)
        {

        }
        
    }

    GetWorkAddress()
    {
        this.AddItems("AddressTypeCode",this.publicData.getWorkAddress().getAddressTypeCode());
        this.AddItems("LocationCode",this.publicData.getWorkAddress().getLocationCode());
        this.AddItems("CompanyNameArabic",this.publicData.getWorkAddress().getCompanyNameArabic());
        this.AddItems("CompanyNameEnglish",this.publicData.getWorkAddress().getCompanyNameEnglish());
        this.AddItems("EmiratesCode",this.publicData.getWorkAddress().getEmiratesCode());
        this.AddItems("EmiratesDescArabic",this.publicData.getWorkAddress().getEmiratesDescArabic());
        this.AddItems("EmiratesDescEnglish",this.publicData.getWorkAddress().getEmiratesDescEnglish());
        this.AddItems("CityCode",this.publicData.getWorkAddress().getCityCode());
        this.AddItems("CityDescArabic",this.publicData.getWorkAddress().getCityDescArabic());
        this.AddItems("CityDescEnglish",this.publicData.getWorkAddress().getCityDescEnglish());
        this.AddItems("POBOX",this.publicData.getWorkAddress().getPOBOX());
        this.AddItems("StreetArabic",this.publicData.getWorkAddress().getStreetArabic());

        this.AddItems("AreaCode",this.publicData.getWorkAddress().getAreaCode());
        this.AddItems("StreetEnglish",this.publicData.getWorkAddress().getStreetEnglish());
        this.AddItems("AreaCode",this.publicData.getWorkAddress().getAreaCode());
        this.AddItems("AreaDescArabic",this.publicData.getWorkAddress().getAreaDescArabic());

        this.AddItems("AreaDescEnglish",this.publicData.getWorkAddress().getAreaDescEnglish());
        this.AddItems("BuildingNameArabic",this.publicData.getWorkAddress().getBuildingNameArabic());
        this.AddItems("BuildingNameEnglish",this.publicData.getWorkAddress().getBuildingNameEnglish());
        this.AddItems("LandPhoneNumber",this.publicData.getWorkAddress().getLandPhoneNumber());

        this.AddItems("MobilePhoneNumber",this.publicData.getWorkAddress().getMobilePhoneNumber());
        this.AddItems("Email",this.publicData.getWorkAddress().getEmail());
    }

    GetHomeAddress()
    {
        this.AddItems("AddressTypeCode",this.publicData.getHomeAddress().getAddressTypeCode());
        this.AddItems("LocationCode",this.publicData.getHomeAddress().getLocationCode());
        this.AddItems("EmiratesCode",this.publicData.getHomeAddress().getEmiratesCode());

        this.AddItems("EmiratesDescArabic",this.publicData.getHomeAddress().getEmiratesDescArabic());
        this.AddItems("EmiratesDescEnglish",this.publicData.getHomeAddress().getEmiratesDescEnglish());
        this.AddItems("CityCode",this.publicData.getHomeAddress().getCityCode());

        this.AddItems("CityDescArabic",this.publicData.getHomeAddress().getCityDescArabic());
        this.AddItems("CityDescEnglish",this.publicData.getHomeAddress().getCityDescEnglish());
        this.AddItems("StreetArabic",this.publicData.getHomeAddress().getStreetArabic());

        this.AddItems("StreetEnglish",this.publicData.getHomeAddress().getStreetEnglish());
        this.AddItems("POBOX",this.publicData.getHomeAddress().getPOBOX());
        this.AddItems("AreaCode",this.publicData.getHomeAddress().getAreaCode());

        this.AddItems("AreaDescArabic",this.publicData.getHomeAddress().getAreaDescArabic());
        this.AddItems("AreaDescEnglish",this.publicData.getHomeAddress().getAreaDescEnglish());
        this.AddItems("BuildingNameArabic",this.publicData.getHomeAddress().getBuildingNameArabic());

        this.AddItems("BuildingNameEnglish",this.publicData.getHomeAddress().getBuildingNameEnglish());
        this.AddItems("FlatNo",this.publicData.getHomeAddress().getFlatNo());
        this.AddItems("ResidentPhoneNumber",this.publicData.getHomeAddress().getResidentPhoneNumber());

        this.AddItems("MobilePhoneNumber",this.publicData.getHomeAddress().getMobilePhoneNumber());
        this.AddItems("Email",this.publicData.getHomeAddress().getEmail());
        
    }

    GetNonModData()
    {
        this.AddItems("IDType",this.publicData.getNonModifiablePublicData().getIDType());
        this.AddItems("IssueDate",this.publicData.getNonModifiablePublicData().getIssueDate());
        this.AddItems("ExpiryDate",this.publicData.getNonModifiablePublicData().getExpiryDate());

        this.AddItems("TitleArabic",this.publicData.getNonModifiablePublicData().getTitleArabic());
        this.AddItems("FullNameArabic",this.publicData.getNonModifiablePublicData().getFullNameArabic());
        this.AddItems("TitleEnglish",this.publicData.getNonModifiablePublicData().getTitleEnglish());

        this.AddItems("Gender",this.publicData.getNonModifiablePublicData().getGender());
        this.AddItems("NationalityArabic",this.publicData.getNonModifiablePublicData().getNationalityArabic());
        this.AddItems("NationalityEnglish",this.publicData.getNonModifiablePublicData().getNationalityEnglish());

        this.AddItems("NationalityCode",this.publicData.getNonModifiablePublicData().getNationalityCode());
        this.AddItems("PlaceOfBirthArabic",this.publicData.getNonModifiablePublicData().getPlaceOfBirthArabic());
        this.AddItems("PlaceOfBirthEnglish",this.publicData.getNonModifiablePublicData().getPlaceOfBirthEnglish());
    }

    GetModData()
    {

        this.AddItems("OccupationCode",this.publicData.getModifiablePublicData().getOccupationCode());
        this.AddItems("OccupationArabic",this.publicData.getModifiablePublicData().getOccupationArabic());        

        this.AddItems("occupationEnglish",this.publicData.getModifiablePublicData().getOccupationEnglish());
        this.AddItems("familyID",this.publicData.getModifiablePublicData().getFamilyID());
        this.AddItems("occupationTypeArabic",this.publicData.getModifiablePublicData().getOccupationTypeArabic());
        this.AddItems("occupationTypeEnglish",this.publicData.getModifiablePublicData().getOccupationTypeEnglish());

        this.AddItems("occupationFieldCode",this.publicData.getModifiablePublicData().getOccupationFieldCode());
        this.AddItems("companyNameArabic",this.publicData.getModifiablePublicData().getCompanyNameArabic());
        this.AddItems("occupationTypeArabic",this.publicData.getModifiablePublicData().getOccupationTypeArabic());
        this.AddItems("maritalStatusCode",this.publicData.getModifiablePublicData().getMaritalStatusCode());

        this.AddItems("husbandIDN",this.publicData.getModifiablePublicData().getHusbandIDN());
        this.AddItems("sponsorTypeCode",this.publicData.getModifiablePublicData().getSponsorTypeCode());
        this.AddItems("sponsorUnifiedNumber",this.publicData.getModifiablePublicData().getSponsorUnifiedNumber());
        this.AddItems("maritalStatusCode",this.publicData.getModifiablePublicData().getMaritalStatusCode());

        this.AddItems("sponsorName",this.publicData.getModifiablePublicData().getSponsorName());
        this.AddItems("residencyTypeCode",this.publicData.getModifiablePublicData().getResidencyTypeCode());
        this.AddItems("residencyNumber",this.publicData.getModifiablePublicData().getResidencyNumber());
        this.AddItems("residencyExpiryDate",this.publicData.getModifiablePublicData().getResidencyExpiryDate());

        this.AddItems("passportNumber",this.publicData.getModifiablePublicData().getPassportNumber());
        this.AddItems("passportTypeCode",this.publicData.getModifiablePublicData().getPassportTypeCode());
        this.AddItems("passportCountryCode",this.publicData.getModifiablePublicData().getPassportCountryCode());
        this.AddItems("passportCountryDescArabic",this.publicData.getModifiablePublicData().getPassportCountryDescArabic());
                
        this.AddItems("passportCountryDescEnglish",this.publicData.getModifiablePublicData().getPassportNumber());
        this.AddItems("PassportIssueDate",this.publicData.getModifiablePublicData().getPassportIssueDate());
        this.AddItems("PassportExpiryDate",this.publicData.getModifiablePublicData().getPassportExpiryDate());
        this.AddItems("QualificationLevelCode",this.publicData.getModifiablePublicData().getQualificationLevelCode());
                
        this.AddItems("QualificationLevelDescArabic",this.publicData.getModifiablePublicData().getQualificationLevelDescArabic());
        this.AddItems("QualificationLevelDescEnglish",this.publicData.getModifiablePublicData().getQualificationLevelDescEnglish());
        this.AddItems("DegreeDescArabic",this.publicData.getModifiablePublicData().getDegreeDescArabic());
        this.AddItems("DegreeDescEnglish",this.publicData.getModifiablePublicData().getDegreeDescEnglish());
                
        this.AddItems("DegreeDescEnglish",this.publicData.getModifiablePublicData().getDegreeDescEnglish());
        this.AddItems("FieldOfStudyArabic",this.publicData.getModifiablePublicData().getFieldOfStudyArabic());
        this.AddItems("FieldOfStudyEnglish",this.publicData.getModifiablePublicData().getFieldOfStudyEnglish());
        this.AddItems("PlaceOfStudyArabic",this.publicData.getModifiablePublicData().getPlaceOfStudyArabic());

        this.AddItems("DateOfGraduation",this.publicData.getModifiablePublicData().getDateOfGraduation());
        this.AddItems("MotherFullNameArabic",this.publicData.getModifiablePublicData().getMotherFullNameArabic());
        this.AddItems("MotherFullNameEnglish",this.publicData.getModifiablePublicData().getMotherFullNameEnglish());
        this.AddItems("FieldOfStudyCode",this.publicData.getModifiablePublicData().getFieldOfStudyCode());
    }

    onTap(event)
    {
        var context = application.android.context;   
        //let env = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + "/EIDAToolkit/";        
        var pluginDirectorPath = context.getApplicationInfo().nativeLibraryDir + "/";
        var configParams = '\n';		
        configParams += 'config_directory =/storage/emulated/0/EIDAToolkit/' ;
        configParams += '\n';
        configParams += 'log_directory =/storage/emulated/0/EIDAToolkit/';
        configParams += '\n';
        configParams +=  'read_publicdata_offline = true';
        configParams += '\n';        
        configParams += 'vg_url = http://172.16.11.13/ValidationGatewayService';
        configParams += '\n';        
        configParams += 'plugin_directory_path ='+pluginDirectorPath;        
        
        try{            
            this.toolkit = com.toolkit.readerapplication.Connector.initialize(application.android.context);
        }
        catch(e)
        {
            dialogs.alert("Got Toolkit Error " +  e.message).then(()=> {
                console.log("Dialog closed!");
            }); 
        }        
    }

    ConnectNS(event)
    {
        try
        {
            let conn = new com.toolkit.readerapplication.Connector();
            conn.show(application.android.context);
        }
        catch(e)
        {
            dialogs.alert("ConnectNS :" + e.message).then(()=> {
                console.log("Dialog closed!");
            }); 
        }
    }

    public doCheckAvailable(event) {
        this.nfc.available().then((avail) => {
          console.log("Available? " + avail);
          dialogs.alert("NFC CheckAvailable :" + avail).then(()=> {
            console.log("Dialog closed!");
        }); 
        }, (err) => {
            dialogs.alert("doCheckAvailable :" + err).then(()=> {
                console.log("Dialog closed!");
            }); 
        });
      }
    
      public doCheckEnabled(event) {
        this.nfc.enabled().then((on) => {
            dialogs.alert("NFC CheckEnabled :" + on).then(()=> {
                console.log("Dialog closed!");
            });           
        }, (err) => {
          alert(err);
        });
      }

      onShowTag(event)
      {
          try
          {
            this.doStartTagListener();
          }
          catch(e)
          {
            dialogs.alert("onShowTag Error :" + e.message).then(()=> {
                console.log("Dialog closed!");
            });  
          }
      }

      ConnectReader(event)
      {
          if(this.toolkit != null)
          {
            try
            {
              this.cardReader = com.toolkit.readerapplication.Connector.initConnection(this.toolkit,application.android.context);
            }
            catch(e)
            {
              dialogs.alert("ConnectReader Error :" + e.message).then(()=> {
                  console.log("Dialog closed!");
              });  
            }
          }
          else
          {
            dialogs.alert("Toolkit is null").then(()=> {
                console.log("Dialog closed!");
            });  
          }
      }
    
      public doStartTagListener() {
        let that = this;
        this.nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
        this.tag = data;
          dialogs.alert("Your tag :" + data.id).then(()=> {
            console.log("Dialog closed!");
        }); 
        }).then(() => {
          console.log("OnTagDiscovered Listener set");
        }, (err) => {
          console.log(err);
        });
      }
}
