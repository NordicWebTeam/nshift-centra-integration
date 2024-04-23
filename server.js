const express = require('express')
const fs = require('fs')
const { get } = require('http')
const axios = require('axios')
const { udcPlugin, udcPluginConfig, nshiftApi, getDeliveryCheckouts, postDeliveryCheckouts, authorize, getPreparedShipment, createShipmentFromPrepared, deletePreparedShipment } = require('nshift-api-sdk')

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.get('/', async (req, res)  => {
    res.render('index')
})

app.get('/udc-lib', async (req, res)  => {
    
    res.type('.js')
    res.send(udcPlugin)
})

app.get('/udc-config', async (req, res)  => {
    //change config if needed
    //udcPluginConfig.config.language = 'en';
    res.json(udcPluginConfig)
})

app.post('/delivery-options', async (req, res) => {

    try {
        let params =  {
            'tocountry' : req.body.tocountry,
            'tozipcode' : req.body.tozipcode,
            'currency'  : req.body.currency,
            'language'  : req.body.language,
            'tocity'    : req.body.tocity,
            'artikel'   : req.body.artikel
        }
        if(req.body.cartprice) {
            params.cartprice = parseFloat(req.body.cartprice)
        }
        if(req.body.weight) {
            params.weight = parseFloat(req.body.weight)
        }
        let getOptions = await getDeliveryCheckouts(params);
        res.status(getOptions.status)
        res.json(getOptions.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.post('/prepared-shipment', async (req, res) => {
    try {
        let selectedOption = JSON.parse(req.body.selectedOption);
        let deliveryCheckoutId = selectedOption.deliveryCheckoutId;
        let selectedOptionId = selectedOption.selectedOptionId;
        let selectedAddons = selectedOption.selectedAddons;
        preparedShipmentBody.selectedOptionId = selectedOptionId;
        preparedShipmentBody.selectedAddons = selectedAddons;
        

        let preparedShipment = await postDeliveryCheckouts( deliveryCheckoutId, preparedShipmentBody);
        res.status(preparedShipment.status)
        res.json(preparedShipment.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.get('/prepared-shipment/:prepareId', async (req, res) => {
    try {
        let preparedShipment = await getPreparedShipment(req.params.prepareId);
        res.status(preparedShipment.status)
        res.json(preparedShipment.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.post('/shipment', async (req, res) => {
    try {
        //let shipment = await deletePreparedShipment(req.body.prepareId);
        let shipment = await createShipmentFromPrepared(req.body.prepareId, shipmentBody);
        res.status(shipment.status)
        res.json(shipment.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

//Centra example
app.get('/centra', async (req, res) => {
    res.render('centra')
})

app.get('/api/checout/selection', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    try {
        let selection = await axiosInstance.get('/api/checout/selection')
        res.status(selection.status)
        res.json(selection.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.put('/api/checout/countries', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    try {
        let selection = await axiosInstance.put('/api/checout/countries/'+req.body.country)
        res.status(selection.status)
        res.json(selection.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.post('/api/checout/items', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    let itemId = req.body.itemId
    let body = {
        "quantity": req.body.quantity
    }
    try {
        let selection = await axiosInstance.post('/api/checout/items/'+itemId, body)
        res.status(selection.status)
        res.json(selection.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})


app.put('/api/checkout/payment-fields', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }

    let body = {
        "address": {
            "email": req.body.email,
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "address1": req.body.address1,
            "zipCode": req.body.zipCode,
            "city": req.body.city,
            "country": req.body.country
        },
        "shippingAddress": {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "address1": req.body.address1,
            "zipCode": req.body.zipCode,
            "city": req.body.city,
            "country": req.body.country
        }
    }
    try {
        let selection = await axiosInstance.put('/api/checout/payment-fields', body)
        res.status(selection.status)
        res.json(selection.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})


app.put('/api/checout/shipping-methods', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    //TODO
    //in order to use this endpoint,create the shipping methods in centra to match the nShift shipping methods
    let selectedOption = JSON.parse(req.body.selectedOption)
    try {
        let selectedOptionId = selectedOption.selectedOptionId;
        let selection = await axiosInstance.put('/api/checout/shipping-methods/' + selectedOptionId)
        res.status(selection.status)
        res.json(selection.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.post('/api/checout/payment', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    let body = {
        // "paymentReturnPage": "https://example.com/success",
        // "paymentFailedPage": "https://example.com/failure",
        // "shippingMethod": "nshift",
        "termsAndConditions": true,
        "address": {
          "newsletter": false,
          "email": "abc123@example.com",
          "phoneNumber": "123456789",
          "firstName": "Test Billing",
          "lastName": "Testson Billing",
          "address1": "Address One",
          "address2": "Address Two",
          "zipCode": "12345",
          "city": "Malmö",
          "country": "SE"
        }
      }
    try {
        let response = await axiosInstance.post('/api/checout/payment', body)
        //if return order create shipment else use /payment-result endpoint to get the order and create shipment
        let order = response.data.order
        //TODO Mapp order data to nShift prepared shipment
        // let selectedOption = JSON.parse(req.body.selectedOption); or get the selected option from order custom attribute
        // let deliveryCheckoutId = selectedOption.deliveryCheckoutId;
        // let selectedOptionId = selectedOption.selectedOptionId;
        // let selectedAddons = selectedOption.selectedAddons;
        // preparedShipmentBody.selectedOptionId = selectedOptionId;
        // preparedShipmentBody.selectedAddons = selectedAddons;
        let deliveryCheckoutId = process.env.deliveryCheckoutId;//untill we get the deliveryCheckoutId from centra order custom attribute

        let preparedShipment = await postDeliveryCheckouts( deliveryCheckoutId, preparedShipmentBody);
        res.status(preparedShipment.status)
        res.json(preparedShipment.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.get('/api/checout/payment-result', async (req, res)  => {
    let apiToken = req.headers['api-token']
    let barearToken = process.env.centraBearerToken
    let url = process.env.centraUrl
    let axiosInstance = axios.create({
        baseURL: url
    })
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + barearToken
    if(apiToken != 'null'){
        axiosInstance.defaults.headers.common['api-token'] = apiToken
    }
    let body = {
        "paymentMethodFields": {
        }
      }
    try {
        let response = await axiosInstance.post('/api/checout/payment-result', body)
        let order = response.data.order
        //TODO Mapp order data to nShift prepared shipment
        // let selectedOption = JSON.parse(req.body.selectedOption); or get the selected option from order custom attribute
        // let deliveryCheckoutId = selectedOption.deliveryCheckoutId;
        // let selectedOptionId = selectedOption.selectedOptionId;
        // let selectedAddons = selectedOption.selectedAddons;
        // preparedShipmentBody.selectedOptionId = selectedOptionId;
        // preparedShipmentBody.selectedAddons = selectedAddons;
        let deliveryCheckoutId = process.env.deliveryCheckoutId;//untill we get the deliveryCheckoutId from centra order custom attribute

        let preparedShipment = await postDeliveryCheckouts( deliveryCheckoutId, preparedShipmentBody);
        res.status(preparedShipment.status)
        res.json(preparedShipment.data)
    } catch (error) {
        if(error.response) {
            res.status(error.response.status)
            res.json(error.response.data)
        } else {
            res.status(400)
            res.send(error.message)
        }
    }
})

app.listen(3001)





let preparedShipmentBody = {
    "shipment": {
      "sender": {
        "name": "nShift Gbg",
        "address1": "Skeppsbron 5-6",
        "zipcode": "41121",
        "city": "GÖTEBORG",
        "country": "SE",
        "phone": "+46 31 725 35 00",
       "email": "email1@example.com"
      },
      "receiver": {
        "name": "nShift Sthm",
        "address1": "Tegnérgatan 34",
        "zipcode": "11359",
        "city": "STOCKHOLM",
        "country": "SE",
        "phone": "+46 8 34 35 15",
        "email": "email2@example.com"
      },
      "parcels": [{
        "copies": 1,
        "weight": 1.2,
        "contents": "important things",
        "valuePerParcel": true
      }],
      "orderNo": "1003",
      "senderReference": "sender ref 1003",
      "receiverReference": "receiver ref 345",
      "options": [{
        "message": "This is order number 1003",
        "to": "email2@example.com",
        "id": "ENOT",
        "languageCode": "sv",
        "from": "email1@example.com"
      }]
    },
    "selectedOptionId": "66a62cd3-e965-4fed-a294-159d3b87adc6",
    "selectedAddons": [],
    "prepareId": "UDC_PREPARE_100012",
    "returnShipmentData": true,
    "language": "en"
  }

  let shipmentBody = {
    "printConfig": {
        "target1Media": "thermo-250",
        "target1Type": "zpl",
        "target1XOffset": 0,
        "target1YOffset": 0,
        "target1Options": [{
          "key": "mode",
          "value": "DT"
        }],
        "target2Media": "laser-a4",
        "target2Type": "pdf",
        "target2XOffset": 0,
        "target2YOffset": 0,
        "target3Media": null,
        "target3Type": null,
        "target3XOffset": 0,
        "target3YOffset": 0,
        "target4Media": null,
        "target4Type": null,
        "target4XOffset": 0,
        "target4YOffset": 0
      },
      "shipment": {
        "sender": {
          "name": "nShift Gbg",
          "address1": "Skeppsbron 5-6",
          "zipcode": "41121",
          "city": "GÖTEBORG",
          "country": "SE",
          "phone": "+46 31 725 35 00",
         "email": "email1@example.com"
        },
        "senderPartners": [{
            "id": "PLAB",
            "custNo": "0204691331"
          }],
        "receiver": {
          "name": "nShift Sthm",
          "address1": "Tegnérgatan 34",
          "zipcode": "11359",
          "city": "STOCKHOLM",
          "country": "SE",
          "phone": "+46 8 34 35 15",
          "email": "email2@example.com"
        },
        "parcels": [{
          "copies": 1,
          "weight": 1.2,
          "contents": "important things",
          "valuePerParcel": true
        }],
        "orderNo": "1003",
        "senderReference": "sender ref 1003",
        "receiverReference": "receiver ref 345",
        "options": [{
          "message": "This is order number 1003",
          "to": "email2@example.com",
          "id": "ENOT",
          "languageCode": "sv",
          "from": "email1@example.com"
        }]
      },
    }