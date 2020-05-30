/***************************************************************
* N.Kozak // Lviv'2020 // ACM // react+redux validator example *
*    file: index.js (renamed from react-redux-validator.jsx)   *
*                             files:                           *
*                                   public                     *
*                                       index.html             *
*                                   src                        *
*                                       App.js                 *
*                                       index.js               *
*                                       styles.css             *
*                                   package.json               *
****************************************************************/
const ATTEMPTS_COUNT = 5
var attemptsDownCount = ATTEMPTS_COUNT;

const GROUPS_DIGITS_COUNT = 5;
const GROUP_DIGITS_SIZE = 5;

const PRODUCT_KEY_PART1 = [
0xF, 0xF, 0xF, 0xF, 0xF,
0xD, 0xD, 0xD, 0xD, 0xD,
0x8, 0x8, 0x8, 0x8, 0x8,
0xB, 0xB, 0xB, 0xB, 0xB,
0xF, 0xF, 0xF, 0xF, 0xF
];

const PRODUCT_KEY_PART2 = [
0xE, 0xE, 0xE, 0xE, 0xE,
0xF, 0xF, 0xF, 0xF, 0xF,
0xB, 0xB, 0xB, 0xB, 0xB,
0xF, 0xF, 0xF, 0xF, 0xF,
0xA, 0xA, 0xA, 0xA, 0xA
];

const DIGITS_COUNT = GROUPS_DIGITS_COUNT * GROUP_DIGITS_SIZE;

var outOfEdgeIndex = 0;
var currIndex = 0;
var data = new Array(DIGITS_COUNT).fill(0); // var data = [];

function integerDiv(a, b){
    return (a - a % b) / b;
}

function checkProductKey(productKey){
    for(var index = 0; index < DIGITS_COUNT; ++index){
        if(productKey[index] ^ PRODUCT_KEY_PART1[index] ^ PRODUCT_KEY_PART2[index]){
            return false;
        }
    }     

	return true
}

function setCaretPosition(elemId, caretPos) {
    var elem = document.getElementById(elemId);

    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
}

function toDigitPosition(currIndex){
	let positionAddon = integerDiv(currIndex, GROUP_DIGITS_SIZE);
	positionAddon && positionAddon >= GROUPS_DIGITS_COUNT ? --positionAddon : 0;
    setCaretPosition("keyInput", currIndex + positionAddon);
}

function printFormattedProductKey(productKey, outOfEdgeIndex){
    var text = "";
    for(var index = 0; index < DIGITS_COUNT && index < outOfEdgeIndex; ++index){
        text += productKey[index].toString(16);
        if((!((index + 1) % GROUP_DIGITS_SIZE)) && (index + 1) < DIGITS_COUNT){
            text += '-';
        }		
    }   
    document.getElementById("keyInput").value = text;
}

function inputHandler(ch, key, hProductsPane) {

    if(!attemptsDownCount){
      window.alert("You have no attempts to try");     
      return;
    }
    if (key == 13) {
        if (checkProductKey(data) ) {
            //window.alert("The product key is correct");
            hProductsPane.props.dispatch({type: 'ADD_PRODUCT'});
            printFormattedProductKey(data, outOfEdgeIndex);
            attemptsDownCount -= 1;
        }
        else{
	        window.alert("The product key is not correct"); 
	        window.alert("You have " + --attemptsDownCount + " attempts to try");      
            if(attemptsDownCount){
                printFormattedProductKey(data, outOfEdgeIndex);	               
                toDigitPosition(currIndex);               
            }
            else{
                window.allert("The product key is not entered");                   
            }
        }
    }

    if (key == 8) {
        if(currIndex){
            --currIndex;            
            toDigitPosition(currIndex);
			data[currIndex] = 0;          
            printFormattedProductKey(data, outOfEdgeIndex);			
        	toDigitPosition(currIndex);
		}     
    } 
    else if (key == 46) {        
        toDigitPosition(currIndex);
		data[currIndex] = 0;
        printFormattedProductKey(data, outOfEdgeIndex);        
        toDigitPosition(currIndex);
	}   
    else if (key == 37) {
        if(currIndex){
	        toDigitPosition(--currIndex); // got to 1.5
		}     
    } 
    else if (key == 39) {
        if(currIndex < outOfEdgeIndex){
			toDigitPosition(++currIndex);
	    }
    }
	
    ch == ' ' || ch == '\t' ? ch = '0' : 0;

    var hexDigitRegularExpression = /^[0-9A-Fa-f]\b/; // /[0-9A-Fa-f]/g

    if (ch && hexDigitRegularExpression.test(ch) && currIndex < DIGITS_COUNT) {
        data[currIndex] = ch.toUpperCase();
        if(outOfEdgeIndex <= currIndex){
            outOfEdgeIndex = currIndex + 1;
        }
        if(currIndex + 1 < DIGITS_COUNT) {
		    ++currIndex;			            
		}   
        printFormattedProductKey(data, outOfEdgeIndex);		
		if(currIndex + 1 == DIGITS_COUNT){
            toDigitPosition(currIndex);		
		}
    }
}

class ProductsPane extends React.Component {
  constructor(props){
    super(props);
    this.escFunctionDown = this.escFunctionDown.bind(this);    
    this.escFunction = this.escFunction.bind(this);
  }
  escFunctionDown(event){
      printFormattedProductKey(data, outOfEdgeIndex);
  }  
  escFunction(event){
    inputHandler(String.fromCharCode(event.keyCode), event.keyCode, this);
  }
  componentDidMount(){
    document.addEventListener("keydown", this.escFunctionDown, false);
    document.addEventListener("keyup", this.escFunction, false);    
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunctionDown, false);
    document.removeEventListener("keyup", this.escFunction, false);    
  }
  
  addProduct = () => {
    var action = {
        type: 'ADD_PRODUCT'
    };
    this.props.dispatch(action);
  }
  
  editProduct = (productId, event) => {
    var newName =  event.target.value;
    var action = {
      type: 'EDIT_PRODUCT',
      data: {productId: productId}
    };
    this.props.dispatch(action);
  }  
 
  removeProduct  = (productId) =>  {
    var action = {
      type: 'REMOVE_PRODUCT',
      productId: productId
    };
    this.props.dispatch(action);
  }  
  
  render(){
    const products = this.props.products; 
    
    var trList = products.map( (product, index) => {
      return (<tr key={product.productId}>
        <td>{product.productId}</td>      
        <td>
          <button onClick={this.removeProduct.bind(null, product.productId)}>
             Remove
          </button>
        </td>
      </tr>);
    });
  
    return (   
    <div>
        <input id="keyInput"/>
        <table border="1">
        <thead>
           <th>Product ID</th>
           <th>Remove</th>
        </thead>
            <tbody>
                {trList}
            </tbody>
        </table>
        <br/>
    </div>      
    );
  }
}

 
var nextProductId = 10;
 
const mapStateToProps = (state) => {
  return {
    products: state.productList
  }
}
 
const getIndexByProductId = (products, productId)  => {
    for(var i = 0; i < products.length; i++) {
       var product = products[i];
       if(product.productId === productId) {
         return i;
       }
    }
    return -1;
};
  
const appReducer = (state = {productList: []}, action) => {
  let products = state.productList.slice();
  console.log('Actions', action); 
  
  switch (action.type) {
    case 'ADD_PRODUCT':
      nextProductId++;
      var product = {productId : nextProductId};
      products.push(product);
      break;
    case 'REMOVE_PRODUCT':
      attemptsDownCount += 1;
      var idx = getIndexByProductId(products, action.productId);
      if(idx != -1)  {
        products.splice(idx, 1);
      }
      break;
  }
  
  const newState = {
    productList: products
  }
  console.log('Current State', newState);
  return newState;
}
 
let store = Redux.createStore(appReducer, {
  productList: []
}, window.devToolsExtension ? window.devToolsExtension() : undefined);
 
const MyApp = ReactRedux.connect (
  mapStateToProps
)(ProductsPane);
 
ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <MyApp />
  </ReactRedux.Provider>,
  document.getElementById('app')
);
 
 
if (window.devToolsExtension) {
  window.devToolsExtension.open();
}