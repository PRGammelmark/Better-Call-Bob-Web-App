import Bruger from '../models/brugerModel.js'
import Opgavetyper from '../models/opgavetyperModel.js'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import validator from "validator"
import axios from "axios"

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '28d' })
}

// GET alle brugere
const getBrugere = async (req,res) => {
    const brugere = await Bruger.find({}).sort({createdAt: -1})
    res.status(200).json(brugere)
}

// GET en enkelt bruger
const getBruger = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Ingen bruger fundet med et matchende ID.'})
    }

    const bruger = await Bruger.findById(id)

    if(!bruger) {
        return res.status(404).json({error: 'Ingen bruger fundet med et matchende ID.'})
    }

    res.status(200).json(bruger)
}

// OPDATER en bruger
const updateBruger = async (req,res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    const bruger = await Bruger.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if(!bruger) {
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    res.status(200).json(bruger)
}

// OPDATER en brugers kodeord

const updateBrugerPassword = async (req, res) => {
    const { id } = req.params
    const { password } = req.body

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'Ingen brugere fundet med et matchende ID.'})
    }

    // if(!validator.isStrongPassword(password)) {
    //     res.status(500).send('Adgangskode er ikke stærk nok!');
    // }

    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)

    const bruger = await Bruger.findOneAndUpdate({_id: id}, {password: hash})

    res.status(200).json(hash)
}

// login bruger

const loginBruger = async (req,res) => {
    const { email, password } = req.body;

    try {
        const bruger = await Bruger.login(email, password);

        // create token
        const token = createToken(bruger._id)

        res.status(200).json({id: bruger._id, email, navn: bruger.navn, telefon: bruger.telefon, isAdmin: bruger.isAdmin, token, satser: bruger.satser, pushSubscription: bruger.pushSubscription})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup bruger

const signupBruger = async (req,res) => {

    const { navn, adresse, titel, telefon, email, password, isAdmin, showTraditionalCalendar, eventColor, satser } = req.body;

    try {
        const bruger = await Bruger.signup(navn, adresse, titel, telefon, email, password, isAdmin, showTraditionalCalendar, eventColor, satser);
        res.status(200).json({email, bruger})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// subscribe to push
const subscribeToPush = async (req, res) => {
    const { subscription } = req.body;

    try {
        const bruger = await Bruger.findByIdAndUpdate(
            req.user._id || req.user.id,
            { pushSubscription: subscription },
            { new: true }
        );

        if (!bruger) {
            return res.status(404).json({ error: "Bruger ikke fundet" });
        }

        console.log("Bruger:", bruger);
        res.status(200).json(bruger);
    } catch (err) {
        console.error("Fejl i subscribeToPush:", err);
        res.status(500).json({ error: "Noget gik galt ved push subscription." });
    }
}

// POST /brugere/push-unsubscribe
const unSubscribeToPush = async (req, res) => {
    try {
      const bruger = await Bruger.findByIdAndUpdate(
        req.user._id || req.user.id,
        { $unset: { pushSubscription: "" } },
        { new: true }
      );
  
      if (!bruger) {
        return res.status(404).json({ error: "Bruger ikke fundet" });
      }
      
      console.log("Bruger:", bruger);
      res.status(200).json(bruger);
    } catch (err) {
      console.error("Fejl i unSubscribeToPush:", err);
      res.status(500).json({ error: "Noget gik galt ved afmelding." });
    }
  };

// GET available workers based on address and task types
const getAvailableWorkers = async (req, res) => {
    try {
        const { adresse, kategorier } = req.body;

        console.log('🔍 getAvailableWorkers called with:', { adresse, kategorier });

        if (!adresse) {
            console.log('❌ Missing address');
            return res.status(400).json({ error: 'Adresse er påkrævet' });
        }

        // Hvis der ikke er kategorier, valider kun adressen og returner tomt array af workers
        if (!kategorier || !Array.isArray(kategorier) || kategorier.length === 0) {
            console.log('⚠️ No categories provided, validating address only');
            
            // Geocode the address using Nominatim
            console.log('🌍 Geocoding address:', adresse);
            const geocodeResponse = await axios.get(
                `https://nominatim.openstreetmap.org/search`,
                {
                    params: {
                        format: 'json',
                        q: adresse,
                        limit: 1,
                        addressdetails: 1
                    }
                }
            );
            
            const geocodeData = geocodeResponse.data;
            console.log('📍 Geocoding result:', geocodeData);
            
            if (!geocodeData || geocodeData.length === 0) {
                console.log('❌ Address not found');
                return res.status(404).json({ error: 'Vi fandt ikke denne adresse. Prøv igen.' });
            }

            // Format the full address from geocoding result to "Gadenavn gadenummer, postnummer by"
            const addressData = geocodeData[0].address || {};
            const road = addressData.road || '';
            const houseNumber = addressData.house_number || '';
            const postcode = addressData.postcode || '';
            const city = addressData.city || addressData.town || addressData.village || addressData.municipality || '';
            
            let formateretAdresse = adresse; // Fallback til original adresse
            
            if (road) {
                // Byg adresse i formatet "Gadenavn gadenummer, postnummer by"
                const gadenavnOgNummer = houseNumber ? `${road} ${houseNumber}` : road;
                const postnummerOgBy = postcode && city ? `${postcode} ${city}` : (postcode || city);
                
                if (postnummerOgBy) {
                    formateretAdresse = `${gadenavnOgNummer}, ${postnummerOgBy}`;
                } else {
                    formateretAdresse = gadenavnOgNummer;
                }
            }
            
            return res.status(200).json({
                workerIDs: [],
                formateretAdresse: formateretAdresse
            });
        }

        // Geocode the address using Nominatim
        console.log('🌍 Geocoding address:', adresse);
        const geocodeResponse = await axios.get(
            `https://nominatim.openstreetmap.org/search`,
            {
                params: {
                    format: 'json',
                    q: adresse,
                    limit: 1,
                    addressdetails: 1
                }
            }
        );
        
        const geocodeData = geocodeResponse.data;
        console.log('📍 Geocoding result:', geocodeData);
        
        if (!geocodeData || geocodeData.length === 0) {
            console.log('❌ Address not found');
            return res.status(404).json({ error: 'Vi fandt ikke denne adresse. Prøv igen.' });
        }

        const addressLat = parseFloat(geocodeData[0].lat);
        const addressLng = parseFloat(geocodeData[0].lon);
        console.log('📍 Address coordinates:', { lat: addressLat, lng: addressLng });

        // Get all employees
        const brugere = await Bruger.find({}).lean();
        console.log(`👥 Found ${brugere.length} total employees`);

        // Get all opgavetyper to map IDs to their opgavetype names
        const alleOpgavetyper = await Opgavetyper.find({}).lean();
        console.log(`📚 Found ${alleOpgavetyper.length} total opgavetyper`);
        
        // Create a map of opgavetype ID to its opgavetype name
        const opgavetypeNavnMap = {};
        alleOpgavetyper.forEach(ot => {
            const id = ot._id.toString();
            opgavetypeNavnMap[id] = ot.opgavetype || '';
        });
        console.log(`🗺️ Created opgavetype navn map with ${Object.keys(opgavetypeNavnMap).length} entries`);

        // Helper function to calculate distance between two coordinates using Haversine formula
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
            const EARTH_RADIUS = 6378137; // meters
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return EARTH_RADIUS * c; // Distance in meters
        };

        // Filter employees based on work area and task types
        const availableWorkers = brugere
            .filter(bruger => {
                console.log(`\n🔎 Checking employee: ${bruger.navn}`);
                
                // Check if employee has work area defined
                if (!bruger.arbejdsOmråde || !bruger.arbejdsOmråde.center || bruger.arbejdsOmråde.center.length !== 2) {
                    console.log(`  ❌ No valid work area center for ${bruger.navn}`);
                    console.log(`     arbejdsOmråde:`, bruger.arbejdsOmråde);
                    return false;
                }

                // Check if employee has a radius defined
                if (!bruger.arbejdsOmråde.radius || bruger.arbejdsOmråde.radius <= 0) {
                    console.log(`  ❌ No valid radius for ${bruger.navn}`);
                    console.log(`     radius:`, bruger.arbejdsOmråde.radius);
                    return false;
                }

                // Calculate distance between address and employee work area center
                const [centerLat, centerLng] = bruger.arbejdsOmråde.center;
                const distance = calculateDistance(addressLat, addressLng, centerLat, centerLng);
                console.log(`  📏 Distance for ${bruger.navn}: ${Math.round(distance)}m (radius: ${bruger.arbejdsOmråde.radius}m)`);

                // Check if address is within employee's work area radius
                if (distance > bruger.arbejdsOmråde.radius) {
                    console.log(`  ❌ Address outside work area for ${bruger.navn}`);
                    return false;
                }

                // Check if employee can handle at least one of the task types
                if (!bruger.opgavetyper || !Array.isArray(bruger.opgavetyper) || bruger.opgavetyper.length === 0) {
                    console.log(`  ❌ No task types for ${bruger.navn}`);
                    console.log(`     opgavetyper:`, bruger.opgavetyper);
                    return false;
                }

                console.log(`  📋 Employee task type IDs:`, bruger.opgavetyper);
                console.log(`  📋 Required categories (opgavetype names):`, kategorier);

                // Get all opgavetype names from employee's opgavetyper
                const employeeOpgavetyper = [];
                bruger.opgavetyper.forEach(opgavetypeId => {
                    const id = typeof opgavetypeId === 'object' ? opgavetypeId.toString() : opgavetypeId;
                    const opgavetypeNavn = opgavetypeNavnMap[id];
                    if (opgavetypeNavn) {
                        employeeOpgavetyper.push(opgavetypeNavn);
                    }
                });
                
                console.log(`  📋 Employee opgavetyper (names):`, employeeOpgavetyper);

                // Check if there's any overlap between required categories (which are opgavetype names) 
                // and employee's opgavetyper names
                const canHandleTask = kategorier.some(kategori => 
                    employeeOpgavetyper.some(empOpgavetype => 
                        empOpgavetype.toLowerCase() === kategori.toLowerCase()
                    )
                );

                console.log(`  ${canHandleTask ? '✅' : '❌'} Can handle task: ${canHandleTask}`);

                return canHandleTask;
            })
            .map(bruger => ({
                id: bruger._id.toString(),
                navn: bruger.navn || 'Ukendt medarbejder'
            }));

        const workerIDs = availableWorkers.map(worker => worker.id);
        const workerNames = availableWorkers.map(worker => worker.navn);
        
        console.log(`\n✅ Found ${availableWorkers.length} available workers with IDs:`, workerIDs);
        console.log(`👥 Worker names:`, workerNames);
        
        // Format the full address from geocoding result to "Gadenavn gadenummer, postnummer by"
        const addressData = geocodeData[0].address || {};
        const road = addressData.road || '';
        const houseNumber = addressData.house_number || '';
        const postcode = addressData.postcode || '';
        const city = addressData.city || addressData.town || addressData.village || addressData.municipality || '';
        
        let formateretAdresse = adresse; // Fallback til original adresse
        
        if (road) {
            // Byg adresse i formatet "Gadenavn gadenummer, postnummer by"
            const gadenavnOgNummer = houseNumber ? `${road} ${houseNumber}` : road;
            const postnummerOgBy = postcode && city ? `${postcode} ${city}` : (postcode || city);
            
            if (postnummerOgBy) {
                formateretAdresse = `${gadenavnOgNummer}, ${postnummerOgBy}`;
            } else {
                formateretAdresse = gadenavnOgNummer;
            }
        }
        
        res.status(200).json({
            workerIDs: workerIDs,
            workerNames: workerNames,
            workers: availableWorkers, // Include full worker objects for convenience
            formateretAdresse: formateretAdresse
        });
    } catch (error) {
        console.error('❌ Error in getAvailableWorkers:', error);
        res.status(500).json({ error: 'Fejl ved søgning efter tilgængelige medarbejdere' });
    }
};

export {
    loginBruger,
    signupBruger,
    getBrugere,
    getBruger,
    updateBruger,
    updateBrugerPassword,
    subscribeToPush,
    unSubscribeToPush,
    getAvailableWorkers
}