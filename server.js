const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db= knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'swami2001',
    database: 'coheal'
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req,res)=>{
	res.send('This is working');
})

//----------------------------------------------------------------------------------
app.post('/cregister',(req,res)=>{
  const { uid, name, age, gender, phno, address, email, password} = req.body;

  if(name.trim().length === 0){
    console.log("Name shouldn't be empty");
    res.status(400).json("Name shouldn't be empty");
  }
  else if(uid.length !== 12){
    console.log("Invalid UID");
    res.status(400).json("Invalid UID");
  }
  else if(age === 0){
    console.log("Age shouldn't be empty");
    res.status(400).json("Age shouldn't be empty");
  }
  else if(gender.trim().length === 0){
    console.log("Select Gender");
    res.status(400).json("Select Gender");
  }
  else if(address.trim().length === 0){
    console.log("Address shouldn't be empty");
    res.status(400).json("Address shouldn't be empty");
  }
  else if(password.length < 8){
    console.log("Password should be at least 8 characters long");
    res.status(400).json("Password should be at least 8 characters long");
  }
  else{
    db.select('uid')
    .from('citizen')
    .where('uid','=',uid)
    .then(ifexist =>{
    	if(ifexist[0]){res.status(400).json("UID '"+ifexist[0].uid+"' already registered ");}
    	else{
    		const hash = bcrypt.hashSync(password);
    		db('citizen').insert({
		      uid: uid,
		      name: name,
		      age: age,
		      gender: gender,
		      phno: phno,
		      address: address,
		      email: email,
		      passwordhash: hash
		    })
		    .returning(['uid','name','age','gender'])
		    .then(user =>{
		      res.json(user);
		    })
		    .catch(err=> res.status(400).json('ERROR: '+err[0]))
    	}
    })
  }
})

//----------------------------------------------------------------------------------
app.post('/login',(req,res)=>{
  db.select('uid','passwordhash')
  .from('citizen')
  .where('uid','=', req.body.uid)
  .then(data=>{
  	if(!data[0]) res.status(400).json('UID not registered');
  	else{
  		const isvalid = bcrypt.compareSync(req.body.password, data[0].passwordhash);
	    if(isvalid){
	      return db.select('uid','name','age','gender','address').from('citizen')
	      .where('uid','=', req.body.uid)
	      .then(user=>{
	        res.json(user[0])
	      })
	      .catch(err=> res.status(400).json('Cant get user'))
	    }
	    else res.status(400).json('Incorrect Password');
  	}
  })
  .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
})

//----------------------------------------------------------------------------------
app.post('/hregister',(req,res)=>{
  const { hid, name, address, pincode, phno, password} = req.body;

  if(hid.length !== 8){
    console.log("Invalid Hospital ID");
    res.status(400).json("Invalid Hospital ID");
  }
  else if(name.trim().length === 0){
    console.log("Name shouldn't be empty");
    res.status(400).json("Name shouldn't be empty");
  }
  else if(address.trim().length === 0){
    console.log("Address shouldn't be empty");
    res.status(400).json("Address shouldn't be empty");
  }
  else if(pincode.length !== 6){
    console.log("Invalid pincode");
    res.status(400).json("Invalid pincode");
  }
  else if(password.length < 8){
    console.log("Password should be at least 8 characters long");
    res.status(400).json("Password should be at least 8 characters long");
  }
  else{
    db.select('hid')
    .from('hospital')
    .where('hid','=',hid)
    .then(ifexist =>{
    	if(ifexist[0]){res.status(400).json("Hospital ID '"+ifexist[0].hid+"' already registered");}
    	else{
    		const hash = bcrypt.hashSync(password);
    		db('hospital').insert({
		      hid: hid,
		      name: name,
		      address: address,
		      pincode: pincode,
		      phno: phno,
		      passwordhash: hash
		    })
		    .returning(['hid','name','address','pincode'])
		    .then(user =>{
		      res.json(user);
		    })
		    .catch(err=> res.status(400).json(err))
    	}
    })
  }
})

//----------------------------------------------------------------------------------
app.post('/hlogin',(req,res)=>{
  db.select('hid','passwordhash')
  .from('hospital')
  .where('hid','=', req.body.hid)
  .then(data=>{
  	if(!data[0]) res.status(400).json('Hospital ID not registered');
  	else{
  		const isvalid = bcrypt.compareSync(req.body.password, data[0].passwordhash);
	    if(isvalid){
	      return db.select('hid','name','address','pincode').from('hospital')
	      .where('hid','=', req.body.hid)
	      .then(user=>{
	        res.json(user[0])
	      })
	      .catch(err=> res.status(400).json('Cant get hospital'))
	    }
	    else res.status(400).json('Incorrect Password');
  	}
  })
  .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
})

//----------------------------------------------------------------------------------
app.post('/alogin',(req,res)=>{
  db.select('aid','passwordhash')
  .from('admin')
  .where('aid','=', req.body.aid)
  .then(data=>{
  	if(!data[0]) res.status(400).json('Admin ID not registered');
  	else{
  		const isvalid = bcrypt.compareSync(req.body.password, data[0].passwordhash);
	    if(isvalid){
	      return db.select('aid').from('admin')
	      .where('aid','=', req.body.aid)
	      .then(user=>{
	        res.json(user[0])
	      })
	      .catch(err=> res.status(400).json('Cant get Admin'))
	    }
	    else res.status(400).json('Incorrect Password');
  	}
  })
  .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
})

//----------------------------------------------------------------------------------
app.post('/hconfirm',(req,res)=>{
  db.select('hid',)
  .from('hospital')
  .where('hid','=', req.body.hid)
  .then(data=>{
    if(!data[0]) res.status(400).json('Hospital ID not registered');
    else{
      return db.select('hid','name','address','pincode').from('hospital')
      .where('hid','=', req.body.hid)
      .then(user=>{
        res.json(user[0])
      })
      .catch(err=> res.status(400).json('Cant get hospital'))
    }
  })
  .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
})

app.post('/hdelete',(req,res)=>{
  db('hospital')
  .where('hid','=', req.body.hid)
  .del()
  .then(()=>{
    db('vacava')
    .where('hid','=', req.body.hid)
    .del()
    .then(()=>{
      res.json("Deleted")
    })
    .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
  })
  .catch(err=> res.status(400).json('Wrong credentials'+err[0]))
})

//----------------------------------------------------------------------------------
app.post('/searchava',(req,res)=>{
  const {pin, opt} =req.body;
  if(pin.length !== 6){
    console.log("Invalid pincode");
    res.status(400).json("Invalid pincode");
  }
  else if((opt !== "Vacc")&&(opt !== "ICU")){
    console.log("Select Option");
    res.status(400).json("Select Option");
  }
  else if(opt === "Vacc"){
    db.select(['hospital.hid','hospital.name','vacava.date','vacava.ava'])
    .from('vacava')
    .join('hospital','vacava.hid','=','hospital.hid')
    .where('hospital.pincode','=', pin)
    .where('vacava.date','>=',new Date())
    .where('vacava.ava','>',0)
    .orderBy('vacava.date')
    .then(data=>{
      if(data.length === 0) res.json('Not Available');
      else res.json(data);
    })
    .catch(err=> res.status(400).json(err))
  }
  else if(opt === "ICU"){
    db.select('hospital.hid','hospital.name','icuava.ava')
    .from('icuava')
    .join('hospital','icuava.hid','=','hospital.hid')
    .where('hospital.pincode','=', pin)
    .where('icuava.ava','>',0)
    .then(data=>{
      if(data.length === 0) res.json('Not Available');
      else res.json(data);
    })
    .catch(err=> res.status(400).json(err))
  }
  else{
    res.json("Error")
  }
})

//----------------------------------------------------------------------------------
app.post('/updatevacava',(req,res)=>{
  const {hid, date, ava} =req.body;
  db.transaction(trx=>{
    trx('vacava')
    .where({hid: hid, date: date})
    .del()
    .then(()=>{
      return trx('vacava')
      .insert({
        hid: hid,
        date: date,
        ava: ava
      })
      .returning(['hid','date','ava'])
      .then(ava =>{
        res.json(ava);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err=> res.status(400).json(err))
})

app.post('/updateicuava',(req,res)=>{
  const {hid, ava} =req.body;
  db.transaction(trx=>{
    trx('icuava')
    .where({hid: hid})
    .del()
    .then(()=>{
      return trx('icuava')
      .insert({
        hid: hid,
        ava: ava
      })
      .returning(['hid','ava'])
      .then(ava =>{
        res.json(ava);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err=> res.status(400).json(err))
})

//----------------------------------------------------------------------------------
app.post('/bookvac',(req,res)=>{
  const {uid, hid, date} = req.body;
  db.transaction(trx=>{
    trx.insert({
      uid: uid,
      hid: hid,
      date: date
    })
    .into('vacbook')
    .returning('vbid')
    .then(vbid=>{
      return trx('vacava')
      .where({hid: hid, date: date})
      .decrement('ava',1)
      .then(()=>{
        res.json(vbid[0]);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err=> res.status(400).json(err))
})

app.post('/bookicu',(req,res)=>{
  const {uid, hid} = req.body;
  db.transaction(trx=>{
    trx.insert({
      uid: uid,
      hid: hid,
      date: new Date()
    })
    .into('icubook')
    .returning('ibid')
    .then(ibid=>{
      return trx('icuava')
      .where({hid: hid})
      .decrement('ava',1)
      .then(()=>{
        res.json(ibid[0]);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err=> res.status(400).json(err))
})

//----------------------------------------------------------------------------------
app.post('/getvacava',(req,res)=>{
  const {hid} =req.body;
  db.select(['date','ava'])
  .from('vacava')
  .where('hid','=',hid)
  .where('date','>=',new Date())
  .where('ava','>',0)
  .orderBy('date')
  .then(data=>{
    if(data.length === 0) res.json('Not Available');
    else res.json(data);
  })
  .catch(err=> res.status(400).json(err))
})

app.post('/geticuava',(req,res)=>{
  const {hid} =req.body;
  db.select(['ava'])
  .from('icuava')
  .where('hid','=',hid)
  .then(data=>{
    if(data.length === 0) res.json('Not Available');
    else res.json(data);
  })
  .catch(err=> res.status(400).json(err))
})

//----------------------------------------------------------------------------------
app.post('/getbookvac',(req,res)=>{
  const {uid} =req.body;
  db.select(['vacbook.vbid','hospital.name','vacbook.date', 'hospital.hid'])
  .from('vacbook')
  .join('hospital','vacbook.hid','=','hospital.hid')
  .where('vacbook.uid','=',uid)
  .then(data=>{
    if(data.length === 0) res.json('Not Available');
    else res.json(data);
  })
  .catch(err=> res.status(400).json(err))
})

app.post('/getbookicu',(req,res)=>{
  const {uid} =req.body;
  db.select(['icubook.ibid','hospital.name','icubook.date','hospital.hid'])
  .from('icubook')
  .join('hospital','icubook.hid','=','hospital.hid')
  .where('icubook.uid','=',uid)
  .then(data=>{
    if(data.length === 0) res.json('Not Available');
    else res.json(data);
  })
  .catch(err=> res.status(400).json(err))
})



app.listen(3001, ()=>{
	console.log('API is running on port:3001')
})