package main
import (
    "bytes"
    "encoding/json"
    "fmt"

    "time"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    sc "github.com/hyperledger/fabric/protos/peer"
)
 type IndexItem struct {
    Requestid string    `json:"requestid"`
    UserId    string    `json:"userid"`
    
 }
type Request struct {
   
    Transactionlist []Transaction `json:"transactionlist"`
}
type Transaction struct {
    TrnsactionDetails map[string]string `json:"transactiondetails"`
}
 

type SimpleChaincode struct {
}
func (t *SimpleChaincode) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	  var index []IndexItem
    jsonAsBytes, err := json.Marshal(index)
    if err != nil {
        fmt.Println("Could not marshal index object", err)
        return shim.Error("error")
    }
    err = APIstub.PutState("index", jsonAsBytes)
    if err != nil {
        fmt.Println("Could not save updated index ", err)
        return shim.Error("error")
    }
    return shim.Success(nil)
}
func (t *SimpleChaincode) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
    function, args := APIstub.GetFunctionAndParameters()
    switch function {
    case "newRequest":
        return t.newRequest(APIstub, args)
    case "updateRequest":
        return t.updateRequest(APIstub, args)
    case "readIndex":
        return t.readIndex(APIstub, args)
    case "readRequest":
        return t.readRequest(APIstub, args)
    case "readAllRequest":
    return t.readAllRequest(APIstub,args)
    }
    return shim.Error("Invalid Smart Contract function name.")
}
//1.newrequest   (#user,#transactionlist)
func (t *SimpleChaincode) newRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    // creating new request
    // {requestid : 1234, involvedParties:['supplier', 'logistics', 'manufacturer','insurance']}
    fmt.Println("creating new newRequest")
    if len(args) < 3 {
        fmt.Println("Expecting three Argument")
        return shim.Error("Expected three arguments for new Request")
    }
    var request Request
    var indexItem IndexItem
    var transaction Transaction
    var index []IndexItem
   
    var requestid = args[0]
   
   
    var transactionString = args[1]
    var userId = args[2]
    fmt.Println(requestid)
    fmt.Println(userId)
   

    indexbytes, err := APIstub.GetState("index")
    if err != nil {
        return shim.Error("index not fetched")
    }
    //unmarshalling index obj
    err = json.Unmarshal(indexbytes, &index)
    if err != nil {
        fmt.Println("unable to unmarshal transaction data")
        return shim.Error("unable to unmarshal transaction data")
    }
    
    transactionmap := make(map[string]string)
    err = json.Unmarshal([]byte(transactionString), &transactionmap)
    if err != nil {
        fmt.Println("Could not marshal index object", err)
        return shim.Error("Could not marshal index object")
    }
    transaction.TrnsactionDetails = transactionmap
    request.Transactionlist = append(request.Transactionlist, transaction)
    //creating a indexitem obj
    indexItem.Requestid = requestid
    //indexItem.Date = date
    indexItem.UserId = userId
    
    //adding index to index item
    index = append(index, indexItem)
    jsonAsBytes, err := json.Marshal(index)
    if err != nil {
        fmt.Println("Could not marshal index object", err)
        return shim.Error("Could not marshal index object")
    }
    err = APIstub.PutState("index", jsonAsBytes)
    if err != nil {
        fmt.Println("Could not save updated index ", err)
        return shim.Error("error")
    }
    //putting request object
    fmt.Println("requestObj",request)
    jsonAsBytes, err = json.Marshal(request)
    if err != nil {
        fmt.Println("Could not marshal request object", err)
        return shim.Error("error")
    }
    err = APIstub.PutState(requestid, jsonAsBytes)
    if err != nil {
        fmt.Println("Could not save updated request ", err)
        return shim.Error("error")
    }
    fmt.Println("Successfully stored the request")
    return shim.Success(nil)
}
//2.updateRequest
func (t *SimpleChaincode) updateRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    // creating new request
    // {requestid : 1234, involvedParties:['supplier', 'logistics', 'manufacturer','insurance']}
    fmt.Println("creating new newRequest")
    if len(args) < 3 {
        fmt.Println("Expecting three Argument")
        return shim.Error("Expected three arguments for new Request")
    }
    var transaction Transaction
    var request Request
    var indexItem IndexItem
    var index []IndexItem
  
    var requestid = args[0]
   
    var transactionString = args[1]
    var userId = args[2]
    fmt.Println(requestid)
    fmt.Println(userId)
    
    indexbytes, err := APIstub.GetState("index")
    if err != nil {
        return shim.Error("error")
    }
    requestbytes, err := APIstub.GetState(requestid)
    if err != nil {
        return shim.Error("error")
    }
    //unmarshalling index obj
    err = json.Unmarshal(indexbytes, &index)
    if err != nil {
        fmt.Println("unable to unmarshal transaction data")
        return shim.Error("error")
    }
    //unmarchalling request Object
    err = json.Unmarshal(requestbytes, &request)
    if err != nil {
        fmt.Println("unable to unmarshal transaction data")
        return shim.Error("unable to unmarshal transaction data")
    }
    transactionmap := make(map[string]string)
    err = json.Unmarshal([]byte(transactionString), &transactionmap)
    if err != nil {
        fmt.Println("Could not marshal index object", err)
        return shim.Error("error unmarshalling the map")
    }
    transaction.TrnsactionDetails = transactionmap
    request.Transactionlist = append(request.Transactionlist, transaction)
    //creating a indexitem obj
    indexItem.Requestid = requestid
    //indexItem.Date = date
    indexItem.UserId = userId
    //var indexlength = len(index) - 1
    //fmt.Println("indexlength-----",indexlength)
    for i := 0; i < len(index); i++ {
        if index[i].Requestid ==  requestid{
            index[i] = indexItem
        //  index[indexlength]=indexItem
            }
    }
    jsonAsBytes, errindex := json.Marshal(index)
    if errindex != nil {
        fmt.Println("Could not marshal index object", errindex)
        return shim.Error("error")
    }
    err = APIstub.PutState("index", jsonAsBytes)
    if err != nil {
        fmt.Println("Could not save updated index ", err)
        return shim.Error("error")
    }
    //putting request object
    jsonAsBytes, err = json.Marshal(request)
    if err != nil {
        fmt.Println("Could not marshal request object", err)
        return shim.Error("error")
    }
    err = APIstub.PutState(requestid, jsonAsBytes)
    if err != nil {
        fmt.Println("Could not save updated request ", err)
        return shim.Error("error")
    }
    fmt.Println("Successfully stored the request")
    return shim.Success(nil)
}
//3. readRequest    (#user) Query
func (t *SimpleChaincode) readIndex(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    // querying the request
    //var index []IndexItem
    indexAsBytes, _ := APIstub.GetState("index")
    //json.Unmarshal(reqAsBytes, &index)
    return shim.Success(indexAsBytes)
}
//4.readtransactionList  (#user) Query
func (t *SimpleChaincode) readRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    // querying the request
    //var request Request
    fmt.Println("Reading the request data for ", args[0])
    reqAsBytes, _ := APIstub.GetState(args[0])
    //json.Unmarshal(reqAsBytes, &request)
    return shim.Success(reqAsBytes)
}
//5.readAlldetails
func (t *SimpleChaincode) readAllRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    //startKey := args[0]
    //endKey := args[1]
    fmt.Println("0",args[0])
    fmt.Println("1",args[1])
    resultsIterator, err := APIstub.GetStateByRange( args[0], args[1])
    if err != nil {
        return shim.Error(err.Error())
    }
    defer resultsIterator.Close()
    // buffer is a JSON array containing QueryResults
    var buffer bytes.Buffer
    buffer.WriteString("[")
    bArrayMemberAlreadyWritten := false
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return shim.Error(err.Error())
        }
        
        // Add a comma before array members, suppress it for the first array member
        if bArrayMemberAlreadyWritten == true {
            buffer.WriteString(",")
        }
        buffer.WriteString("{\"Key\":")
        buffer.WriteString("\"")
        buffer.WriteString(queryResponse.Key)
        buffer.WriteString("\"")
        buffer.WriteString(", \"Record\":")
        // Record is a JSON object, so we write as-is
        buffer.WriteString(string(queryResponse.Value))
        buffer.WriteString("}")
        bArrayMemberAlreadyWritten = true
    }
    buffer.WriteString("]")
    fmt.Printf("- queryAll:\n%s\n", buffer.String())
    return shim.Success(buffer.Bytes())
}
func makeTimestamp() string {
    t := time.Now()
    return t.Format(("2006-01-02T15:04:05.999999-07:00"))
    //return time.Now().UnixNano() / (int64(time.Millisecond)/int64(time.Nanosecond))
}
// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {
    // Create a new Smart Contract
    err := shim.Start(new(SimpleChaincode))
    if err != nil {
        fmt.Printf("Error creating new Smart Contract: %s", err)
    }
}