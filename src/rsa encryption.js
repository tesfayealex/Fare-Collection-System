const crypto = require("crypto")

// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is "rsa"
// 2. An object with the properties of the key
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {              //It Generates a new asymmetric key pair of the
	
	modulusLength: 2048, // The standard secure default length for RSA keys is 2048 bits
})


const data = "my secret data" // This is the data we want to encrypt

const encryptedData = crypto.publicEncrypt(   //encrypting the data with the publickey generated
	{
		key: publicKey,   // Public key we generated before
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, //practices which all include adding data to the beginning, middle, or end of a message prior to encryption
		oaepHash: "sha256", // hashing algorithm being used is sha256 which is secure engough upto this time
	},
	Buffer.from(data) // We convert the data string to a buffer using `Buffer.from`
)

// The encrypted data is in the form of bytes, so we print it in base64 format
// so that it's displayed in a more readable form
console.log("encypted data: ", encryptedData.toString("base64")) //output

const decryptedData = crypto.privateDecrypt( //decrypting the encrypted data with the private key
	{
		key: privateKey, // private key we generated before
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // same padding scheme that we used to encrypt the data
		oaepHash: "sha256", // same hashing function that we used to to encrypt the data 
	},
	encryptedData //the data that was encrypted
)

// The decrypted data is of the Buffer type, which we can convert to a string to reveal the original data
console.log("decrypted data: ", decryptedData.toString()) //output

// Create some sample data that we want to sign
const verifiableData = "this need to be verified" // the data

// The signature method takes the data we want to sign, the
// hashing algorithm, and the padding scheme, and generates
// a signature in the form of bytes
const signature = crypto.sign("sha256", Buffer.from(verifiableData), {   // signing the data with our private key
	key: privateKey, //private key generated before
	padding: crypto.constants.RSA_PKCS1_PSS_PADDING, //practices which all include adding data to the beginning, middle, or end of a message prior to encryption
})

console.log(signature.toString("base64"))   // output

// To verify the data, we provide the same hashing algorithm and
// padding scheme we provided to generate the signature, along
// with the signature itself, the data that we want to
// verify against the signature, and the public key
const isVerified = crypto.verify(  //verifing the sender of the 
	"sha256", // same hashing function that we used to to encrypt the data
	Buffer.from(verifiableData), // changing data in to a buffer of bytes
	{
		key: publicKey, // using the previos public key to verify the sender of the data 
		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,//using the same padding scheme we provided to generate the signature
	},
	signature // the signiture to be verified
)

console.log("signature verified: ", isVerified) // isVerified should be `true` if the signature is valid