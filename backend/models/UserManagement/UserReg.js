const { default: mongoose, Schema } = require("mongoose");
const schema = mongoose.Schema;


const regiSchema = new schema ({
          name : {
            type :  String , //dataType
            required : true , //validate
          },

          // String, not Number: Sri Lankan numbers start with a leading zero
          // (0771234567) which a Number silently discards.
           phone : {
            type :  String ,
            required : true ,
            trim : true ,
            match : [/^0\d{9}$/, "Phone must be 10 digits starting with 0, e.g. 0771234567"],
          },

          age : {
            type :  Number , //dataType
            required : true , //validate
            min : [18, "Staff must be at least 18"],
            max : [70, "Age must be 70 or below"],
          },

          gmail : {
            type :  String ,
            required : true ,
            unique : true ,
            trim : true ,
            lowercase : true ,
            match : [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
          },

           position : {
            type :  String , //dataType
            required : true , //validate
          },

           status : {
            type :  String , //dataType
            required : true , //validate
          },

           address : {
            type :  String , //dataType
            required : true , //validate
          },

          password : {
            type :  String , //dataType
            required : true , //validate
          },

            staffId: { type: String, unique: true, required: true }



});

// The password hash must never reach the client — several endpoints return user
// documents straight to the frontend, which persists them into localStorage.
// Stripping it here covers every response rather than each call site.
regiSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.password;
		return ret;
	},
});


module.exports = mongoose.model("Users", regiSchema);
