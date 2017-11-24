/*
Copyright IBM Corp 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"encoding/json"
	//"errors"
	"fmt"
	"strconv"
	"time"
	//"strings"
	//"reflect"

	
     
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var userIndexStr = "_userindex"  

type Agreement struct{
    Id                 int     `json:"id"`
    ConsignmentWeight  int     `json:"consignmentweight"`
    ConsignmentValue   int     `json:"consignmentvalue"`
    InvoiceNo          int     `json:"invoiceno"`
    ModeofTransport    string  `json:"modeoftransport"`
    PackingMode        string  `json:"packingmode"`
    ContractType       string  `json:"contracttype"`
    PolicyType         string  `json:"policytype"`
    ConsignmentType    string  `json:"consignmenttype"`
}
type AllAgreement struct{
    Querylist []Agreement `json:"querylist"`
}
type Consignment struct{
    
    UserId                  string     `json:"id"`
    ConsignmentWeight       int     `json:"consignmentweight"`
    ConsignmentValue        int     `json:"consignmentvalue"`
    PolicyName              string  `json:"policyname"`
    SumInsured              int     `json:"suminsured"`
    PremiumAmount           int     `json:"premiumamount"`
    ModeofTransport         string  `json:"modeoftransport"`
    PackingMode             string  `json:"packingmode"`
    ConsignmentType         string  `json:"consignmenttype"`
    ContractType            string  `json:"contracttype"`
    PolicyType              string  `json:"policytype"`
    Email                   string  `json:"email"`
    PolicyHolderName        string  `json:"policyholdername"`
    UserType                string  `json:"usertype"`
    InvoiceNo               int     `json:"invoiceno"`
    PolicyNumber            int     `json:"policynumber"`
	PolicyIssueDate         string  `json:"policyissuedate"`
	PolicyEndDate           string  `json:"policyenddate"`
	VoyageStartDate         string  `json:"voyagestartdate"`
	VoyageEndDate           string  `json:"voyageenddate"`

}
type AllConsignment struct{
    Consignmentlist []Consignment `json:"consignmentlist"`
}

type Claim struct {
	InsuredId           string  `json:"insuredid"`
	PolicyNumber        int     `json:"policynumber"`
    ClaimNo             int      `json:"claimno"`
	ExaminerId          string      `json:"examinerid"`
	ClaimAdjusterId     string      `json:"claimadjusterid"`
	PublicAdjusterId    string      `json:"publicadjusterid"`
	Status   	        string   `json:"status"`
	Title	            string   `json:"title"`
    DamageDetails	        string   `json:"damagedetails"`
    TotalDamageValue 	int      `json:"totaldamagevalue"`
    TotalClaimValue 	int      `json:"totalclaimvalue"`
	Documents	        []Document   `json:"document"`
	ClaimNotifiedDate   time.Time     `json:"claimnotifieddate"`
	ClaimSubmittedDate  time.Time       `json:"claimsubmitteddate"`
	Remark string `json:"remark"`
    AssessedDamageValue	int       `json:"assesseddamagevalue"`
    AssessedClaimValue	int       `json:"assessedclaimvalue"`
	ClaimExaminedDate  time.Time     `json:"claimexamineddate"`
    ClaimValidatedDate   time.Time     `json:"claimvalidateddate"`
    Negotiationvalue	[]Negotiation  `json:"negotiationlist"`
    ApprovedClaim	    int       `json:"approvedclaim"`
	ClaimApprovedDate   time.Time      `json:"claimapproveddate"`
	ClaimSettledDate   time.Time     `json:"claimsettleddate"`

   }

type ClaimList struct{
	Claimlist []Claim `json:"claimlist"`// contains array of claims
}

type Document struct{

ClaimId             int      `json:"claimid"`
FIRCopy             string   `json:"fircopy"`//the fieldtags of User Document hashvalue are needed to store in the ledger
Photos              string   `json:"photos"`
Certificates        string   `json:"certificates"`


}

type Negotiation struct{
Id                  string      `json:"id"`
Negotiations        int       `json:"negotiationvalue"`//the fieldtags of claim Negotiation are needed to store in the ledger
AsPerTerm2B         string      `json:"asperterm"`
}
 
type ExaminedUpdate struct{
Id                  string       `json:"id"`
ClaimId             int        `json:"claimid"`
AssessedDamageValue	int       `json:"assesseddamagevalue"`//the field tags of examiner
AssessedClaimValue	int       `json:"assessedclaimvalue"`

} 

type SimpleChaincode struct {
}

// Main Function

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode - %s", err)
	}
}

// Init Function - reset all the things
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("COMMERCIAL INSURANCE Is Starting Up")
	args := stub.GetStringArgs()
	var Aval int
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// convert numeric string to integer
	Aval, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting a numeric string argument to Init()")
	}

	// store compaitible marbles application version
	err = stub.PutState("commercial_insurance", []byte("1.0"))
	if err != nil {
		return shim.Error(err.Error())
	}

	// this is a very simple dumb test.  let's write to the ledger and error on any errors
	err = stub.PutState("abc", []byte(strconv.Itoa(Aval))) //making a test var "selftest", its handy to read this right away to test the network
	if err != nil {
		return shim.Error(err.Error())                          //self-test fail
	}

	fmt.Println(" - ready for action")                          //self-test pass
	return shim.Success(nil)
}

// Invoke is ur entry point to invoke a chaincode function
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "init" {                //initialize the chaincode state, used as reset
		return t.Init(stub)
	} else if function == "write" {
		return t.write(stub, args)          //writes a value to the chaincode state

	} else if function == "read" {
		return t.read(stub, args)          //writes a value to the chaincode state

	} else if function=="consignmentDetail"{
        return t.consignmentDetail(stub, args)
    
	} else if function == "notifyClaim" {  //writes claim details with status notified in ledger
		return t.notifyClaim(stub, args)

	} else if function == "createClaim" {  //writes  claim details with status approved in ledger
		return t.createClaim(stub, args)

	} else if function == "Delete" {        //deletes an entity from its state
		return t.Delete(stub, args)

	} else if function == "UploadDocuments" {        //upload the dcument hash value 
		return t.UploadDocuments(stub, args)

	} else if function == "rejectClaim" { //upload the dcument hash value 
        return t.rejectClaim(stub, args)

    } else if function == "ExamineClaim" {        //Examine and updtaes the claim with status examined
		return t.ExamineClaim(stub, args)

	} else if function == "ClaimNegotiation" {        //claim negotiations takes place between public adjuster and claim adjuster
		return t.ClaimNegotiation(stub, args)

	} else if function == "approveClaim" {        //after negotiation claim amount is finalised and approved
		return t.approveClaim(stub, args)

	} else if function == "settleClaim" {        //after negotiation claim amount is finalised and approved
		return t.settleClaim(stub, args)

	}

	fmt.Println("invoke did not find func: " + function)

	return shim.Error("Received unknown invoke function name - '" + function + "'")
}

// write - invoke function to write key/value pair
func (t *SimpleChaincode) write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("starting write")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2. key of the variable and value to set")
	}

	// input sanitation
	

	key = args[0]                                   //rename for funsies
	value = args[1]
	err = stub.PutState(key, []byte(value))         //write the variable into the ledger
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end write")
	return shim.Success(nil)
}

// Query is our entry point for queries
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Error("Unknown supported call - Query()")
}

// read - query function to read key/value pair

func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	

	key = args[0]
	valAsbytes, err := stub.GetState(key)           //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes)                  //send it onward
}

func (t *SimpleChaincode) Delete(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	name := args[0]
	err := stub.DelState(name)													//remove the key from chaincode state
	if err != nil {
		return shim.Error(err.Error())
	}

	//get the user index
	userAsBytes, err := stub.GetState(userIndexStr)
	if err != nil {
		return shim.Error(err.Error())
	}
	var userIndex []string
	json.Unmarshal(userAsBytes, &userIndex)								//un stringify it aka JSON.parse()
	
	//remove user from index
	for i,val := range userIndex{
		fmt.Println(strconv.Itoa(i) + " - looking at " + val + " for " + name)
		if val == name{															//find the correct index
		
			userIndex = append(userIndex[:i], userIndex[i+1:]...)			//remove it
			for x:= range userIndex{											//debug prints...
				fmt.Println(string(x) + " - " + userIndex[x])
			}
			break
		}
	}
	jsonAsBytes, _ := json.Marshal(userIndex)									//save new index
	err = stub.PutState(userIndexStr, jsonAsBytes)
    return shim.Success(nil)
}



//consignmentDetail- invoke function store details of consignmentDetails.
func(t* SimpleChaincode) consignmentDetail(stub shim.ChaincodeStubInterface,args []string) pb.Response {
    
    var err error
    if len(args) != 20 {
        return shim.Error(" hi Incorrect number of arguments. Expecting 20")
    }
     //input sanitation
    fmt.Println("- start filling policy detail")
    if len(args[0])<= 0{
        return shim.Error("1st argument must be a non-empty string")
    }
    if len(args[1]) <= 0 {
        return shim.Error("2st argument must be a non-empty string")
    }
    if len(args[2]) <= 0 {
        return shim.Error("3rd argument must be a non-empty string")
    }
    if len(args[3]) <= 0 {
        return shim.Error("4th argument must be a non-empty string")
    }
     if len(args[4]) <= 0 {
        return shim.Error("5th argument must be a non-empty string")
    }
    if len(args[5]) <= 0{
        return shim.Error("6th argument must be a non-empty string")
    }
    if len(args[6]) <= 0{
        return shim.Error("7th argument must be a non-empty string")
    }
    if len(args[7]) <= 0{
        return shim.Error("8th argument must be a non-empty string")
    }
    if len(args[8]) <= 0{
        return shim.Error("9th argument must be a non-empty string")
    }
    if len(args[9]) <= 0{
        return shim.Error("10th argument must be a non-empty string")
    }
    if len(args[10]) <= 0{
        return shim.Error("11th argument must be a non-empty string")
    }
    if len(args[11]) <= 0{
        return shim.Error("12th argument must be a non-empty string")
    }
    if len(args[12]) <= 0{
        return shim.Error("13th argument must be a non-empty string")
    }
    if len(args[13]) <= 0{
        return shim.Error("14th argument must be a non-empty string")
    }
    if len(args[14]) <= 0{
        return shim.Error("15th argument must be a non-empty string")
    }
    if len(args[15]) <= 0{
        return shim.Error("16th argument must be a non-empty string")
    }
	if len(args[16]) <= 0{
        return shim.Error("17th argument must be a non-empty string")
    }
    if len(args[17]) <= 0{
        return shim.Error("18th argument must be a non-empty string")
    }
    if len(args[18]) <= 0{
        return shim.Error("19th argument must be a non-empty string")
    }
    if len(args[19]) <= 0{
        return shim.Error("20th argument must be a non-empty string")
    }
    
    consignment:=Consignment{}
    consignment.UserId = args[0]
    
    
    consignment.ConsignmentWeight, err = strconv.Atoi(args[1])
    if err != nil {
        return shim.Error("Failed to get ConsignmentWeight as cannot convert it to int")
    }
    consignment.ConsignmentValue, err = strconv.Atoi(args[2])
    if err != nil {
        return shim.Error("Failed to get ConsignmentValue as cannot convert it to int")
    }
    consignment.PolicyName=args[3]
    fmt.Println("consignment", consignment)
    consignment.SumInsured, err = strconv.Atoi(args[4])
    if err != nil {
        return shim.Error("Failed to get SumInsured as cannot convert it to int")
    }
    consignment.PremiumAmount, err = strconv.Atoi(args[5])
    if err != nil {
        return shim.Error("Failed to get Arun as cannot convert it to int")
    }
    
    consignment.ModeofTransport=args[6]
    fmt.Println("consignment", consignment)
    consignment.PackingMode=args[7]
    fmt.Println("consignment", consignment)
    consignment.ConsignmentType=args[8]
    fmt.Println("consignment", consignment)
    consignment.ContractType=args[9]
    fmt.Println("consignment", consignment)
    consignment.PolicyType=args[10]
    fmt.Println("consignment", consignment)
    
    consignment.Email=args[11]
    fmt.Println("consignment", consignment)
    
    consignment.PolicyHolderName=args[12]
    fmt.Println("consignment", consignment)
    consignment.UserType=args[13]
    fmt.Println("consignment", consignment)
    consignment.InvoiceNo, err = strconv.Atoi(args[14])
    if err != nil {
        return shim.Error("Failed to get InvoiceNo as cannot convert it to int")
    }
    consignment.PolicyNumber, err = strconv.Atoi(args[15])
    if err != nil {
        return shim.Error("Failed to get PolicyNumber as cannot convert it to int")
    }
	consignment.PolicyIssueDate = args[16]
	consignment.PolicyEndDate = args[17]
	consignment.VoyageStartDate = args[18]
	consignment.VoyageEndDate = args[19]
    
    consignmentAsBytes, err := stub.GetState("getconsignment")
    if err != nil {
        return shim.Error("Failed to get consignment")
    }
    
    var allconsignment AllConsignment
    json.Unmarshal(consignmentAsBytes, &allconsignment) //un stringify it aka JSON.parse()
    allconsignment.Consignmentlist = append(allconsignment.Consignmentlist, consignment)
    fmt.Println("allconsignment",  allconsignment.Consignmentlist) //append to allconsignment
    fmt.Println("! appended policy to allconsignment")
    
    jsonAsBytes, _ := json.Marshal(allconsignment)
    fmt.Println("json", jsonAsBytes)
    err = stub.PutState("getconsignment", jsonAsBytes) //rewrite allconsignment
    if err != nil {
       return shim.Error(err.Error())
    }
    
    fmt.Println("- end of the consignmentdetail")
    return shim.Success(nil)
    
}


//notification of claim from insured takes place
func (t *SimpleChaincode) notifyClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
		if len(args) != 5 {
			return shim.Error("Incorrect number of arguments. Expecting 4")
		}

		//input sanitation
		
	
		fmt.Println("- start NotifyClaim")
    if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	if len(args[4]) <= 0 {
		return shim.Error("5th argument must be a non-empty string")
	}
		
	
	claim:=Claim{}
	claim.PolicyNumber,err = strconv.Atoi(args[0])
    if err != nil {
		return shim.Error("oth argument must be a numeric string")
	}

	claim.ClaimNo, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("1st argument must be a numeric string")
	}
	
	claim.Title = args[2]
	claim.DamageDetails=args[3]
	claim.InsuredId=args[4]
	claim.ClaimNotifiedDate=time.Now()
    claim.Status="Notified"
	
	fmt.Println("claim",claim)
//get claims empty[]
    UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)										//un stringify it aka JSON.parse()
	
	claimlist.Claimlist = append(claimlist.Claimlist,claim);	
	fmt.Println("campaignallusers",claimlist.Claimlist)					//append each claim to claimlist[]
	fmt.Println("! appended cuser to campaignallusers")
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								//rewrite claimlist[]
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("- end claimlist")
return shim.Success(nil)
}
//application of claim from insuured takes place after notification
func (t *SimpleChaincode) createClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
		if len(args) != 4 {
			return shim.Error("Incorrect number of arguments. Expecting 4")
		}

		//input sanitation
		fmt.Println("- start createClaim")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
		
		
	
	
	
	
	ClaimId,err  := strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("1st argument must be a numeric string")
	}
	TotalDamageValue,err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("2nd argument must be a numeric string")
	}
	TotalClaimValue,err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("3rd argument must be a numeric string")
	}
    Status:="Submitted"
	PublicAdjusterId :=args[3]
	ClaimSubmittedDate:=time.Now()
	
	
    UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	  
	
		for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==ClaimId){

claimlist.Claimlist[i].TotalDamageValue = TotalDamageValue
claimlist.Claimlist[i].TotalClaimValue = TotalClaimValue
	
claimlist.Claimlist[i].Status=Status
claimlist.Claimlist[i].PublicAdjusterId=PublicAdjusterId
claimlist.Claimlist[i].ClaimSubmittedDate=ClaimSubmittedDate
}
	
	
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
	fmt.Println("- end claimlist")
return shim.Success(nil)
}
//upload documents of insured in form of hash takes place			

func (t *SimpleChaincode) UploadDocuments(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	//input sanitation
	fmt.Println("- start registration")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}

	
	document:=Document{}
	
	document.ClaimId,err  = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Failed to get ClaimId as cannot convert it to int")
	}
	document.FIRCopy = args[1]
	
    document.Photos=args[2]
	document.Certificates=args[3]

	
	fmt.Println("document",document)

    UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	
	
		for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==document.ClaimId){

claimlist.Claimlist[i].Documents = append(claimlist.Claimlist[i].Documents,document);

}
	
	
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
		
fmt.Println("- end uploaddocumen")
return shim.Success(nil)
	}


func (t *SimpleChaincode) rejectClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
    var err error


    if len(args) != 2 {
        return shim.Error("Incorrect number of arguments. Expecting 2")
    }

    //input sanitation
    fmt.Println("- start rejectClaim")
    if len(args[0]) <= 0 {
        return shim.Error("1st argument must be a non-empty string")
    }
	if len(args[1]) <= 0 {
        return shim.Error("2nd argument must be a non-empty string")
    }




    ClaimId, err := strconv.Atoi(args[0])
    if err != nil {
        return shim.Error("Failed to get ClaimId as cannot convert it to int")
    }
    Remark := args[1]

    Status := "Rejected"




    UserAsBytes, err := stub.GetState("getclaims")
    if err != nil {
        return shim.Error("Failed to get claims")
    }

    var claimlist ClaimList
    json.Unmarshal(UserAsBytes, & claimlist) //un stringify it aka JSON.parse()




    for i := 0;i < len(claimlist.Claimlist);i++{


        if(claimlist.Claimlist[i].ClaimNo == ClaimId) {


            claimlist.Claimlist[i].Status = Status
            claimlist.Claimlist[i].Remark = Remark

        }
        jsonAsBytes, _:= json.Marshal(claimlist)
        fmt.Println("json", jsonAsBytes)
        err = stub.PutState("getclaims", jsonAsBytes)
        if err != nil {
            return shim.Error(err.Error())
        }
    }

    fmt.Println("- end reject claim")
    return shim.Success(nil)
}


//examination of claim takes place from examiner
func (t *SimpleChaincode) ExamineClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	//input sanitation
	fmt.Println("- start ExamineClaim")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	
	
	examine:=ExaminedUpdate{}
	examine.Id = args[0]
	
	examine.ClaimId,err  = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Failed to get ClaimId as cannot convert it to int")
	}
	examine.AssessedDamageValue,err = strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("Failed to get AssessedDamageValue as cannot convert it to int")
	}
	examine.AssessedClaimValue,err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Failed to get AssessedClaimValue as cannot convert it to int")
	}
    Status:="Examined"
	ClaimExaminedDate:=time.Now()

	
	fmt.Println("examine",examine)

UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	
	
		for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==examine.ClaimId){

claimlist.Claimlist[i].AssessedDamageValue = examine.AssessedDamageValue
claimlist.Claimlist[i].AssessedClaimValue = examine.AssessedClaimValue
claimlist.Claimlist[i].Status=Status
claimlist.Claimlist[i].ExaminerId=examine.Id
claimlist.Claimlist[i].ClaimExaminedDate=ClaimExaminedDate
}
	
	
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
		
fmt.Println("- end ExaminedDocument")
 return shim.Success(nil)
	}
//claim negotiation between public adjuster and claim adjuster takes place
func (t *SimpleChaincode) ClaimNegotiation(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	//input sanitation
	fmt.Println("- start ClaimNegotiation")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	
	
	
	negotiation:=Negotiation{}
	negotiation.Id = args[0]
	
	ClaimId,err  := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Failed to get ClaimId as cannot convert it to int")
	}
	negotiation.Negotiations,err = strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("Failed to get Negotiations as cannot convert it to int")
	}
	negotiation.AsPerTerm2B=args[3]

	Status:="Validated"
	ClaimValidatedDate:=time.Now()
	

	
	fmt.Println("negotiation",negotiation)

UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	
	
		for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==ClaimId){
		if(claimlist.Claimlist[i].Negotiationvalue == nil){
claimlist.Claimlist[i].Status=Status
claimlist.Claimlist[i].ClaimAdjusterId=negotiation.Id
claimlist.Claimlist[i].Negotiationvalue = append(claimlist.Claimlist[i].Negotiationvalue,negotiation);
claimlist.Claimlist[i].ClaimValidatedDate=ClaimValidatedDate
}else {
claimlist.Claimlist[i].Status=Status
claimlist.Claimlist[i].Negotiationvalue = append(claimlist.Claimlist[i].Negotiationvalue,negotiation);
claimlist.Claimlist[i].ClaimValidatedDate=ClaimValidatedDate
}
	}
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
		
fmt.Println("- end Negotiation")
 return shim.Success(nil) 
	}
//after negotiation claim amount will be finalised and approved
func (t *SimpleChaincode) approveClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	//input sanitation
	fmt.Println("- start approveClaim")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	
	
	
	
	
	ClaimId,err  := strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Failed to get ClaimId as cannot convert it to int")
	}
	

	Status:="Approved"
	ClaimApprovedDate:=time.Now()

	
	
UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	
	
		for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==ClaimId){
		index:=len(claimlist.Claimlist[i].Negotiationvalue) 
		if(index==index){
                claimlist.Claimlist[i].Status=Status
				 claimlist.Claimlist[i].ClaimApprovedDate=ClaimApprovedDate
              onlyindex := (index - 1)
                onlynegotiation := claimlist.Claimlist[i].Negotiationvalue[onlyindex]
                claimlist.Claimlist[i].ApprovedClaim = onlynegotiation.Negotiations
        
		}
	}
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
		
fmt.Println("- end approve claim")
return shim.Success(nil)
	}


func (t *SimpleChaincode) settleClaim(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error

	
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	//input sanitation
	fmt.Println("- start settleClaim")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	
	
	
	
	
	ClaimId,err  := strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Failed to get ClaimId as cannot convert it to int")
	}
	

	Status:="Settled"
	ClaimSettledDate:=time.Now()

	
	
UserAsBytes, err := stub.GetState("getclaims")
	if err != nil {
		return shim.Error("Failed to get claims")
	}
	
	var claimlist ClaimList
	json.Unmarshal(UserAsBytes, &claimlist)	//un stringify it aka JSON.parse()
	
	

		
		
	for i:=0;i<len(claimlist.Claimlist);i++{
		
		
	if(claimlist.Claimlist[i].ClaimNo==ClaimId){


claimlist.Claimlist[i].Status=Status

claimlist.Claimlist[i].ClaimSettledDate=ClaimSettledDate
}
	jsonAsBytes, _ := json.Marshal(claimlist)
	fmt.Println("json",jsonAsBytes)
	err = stub.PutState("getclaims", jsonAsBytes)								
	if err != nil {
		return shim.Error(err.Error())
	}
	}
		
fmt.Println("- end settled claim")
return shim.Success(nil) 
	}
