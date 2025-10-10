import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Styles from "./ArbejdsRadiusMap.module.css";
import { Radius, MapPin } from "lucide-react"
import axios from "axios"
import { useIndstillinger } from '../context/IndstillingerContext.jsx'


const EARTH_RADIUS = 6378137;         // meter
const TILE_SIZE = 256;                // Leaflet CSS px
const INITIAL_RES = (2 * Math.PI * EARTH_RADIUS) / TILE_SIZE; // m/px @ z=0, ækvator

// Korrekt konvertering: ønsket meters-per-pixel ved center-lat
const radiusToZoom = (radiusMeters, centerLat, circlePx) => {
  const mppTarget = (2 * radiusMeters) / circlePx; // m pr. px vi vil have
  const latRad = (centerLat * Math.PI) / 180;
  const scale = (INITIAL_RES * Math.cos(latRad)) / mppTarget; // = 2^z
  const z = Math.log2(scale);
  // Clamp for at undgå ekstreme zooms
  return Math.max(2, Math.min(20, z));
};

// const fetchAddress = async (lat, lng) => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
//       );
//       const data = await res.json();
//       const formateretAdresse = (data.address.road + (data.address.house_number ? (" " + data.address.house_number) : "") + ", " + data.address.postcode + " " + (data.address.city || data.address.town))
//       setAdresse(formateretAdresse)
//     } catch (err) {
//       console.error("Geocoding fejl:", err);
//     }
//   };

//     function CenterUpdater({ onMoveEnd }) {
//         const map = useMapEvents({
//         dragend: () => {
//             const c = map.getCenter();
//             onMoveEnd([c.lat, c.lng]);
//             fetchAddress(c.lat, c.lng);
//         }
//         });
//         return null;
//     }

function ZoomUpdater({ zoom, center }) {
    const map = useMap();
    useEffect(() => {
        const currentZoom = map.getZoom();
        const currentCenter = map.getCenter();
        // check før vi ændrer
        if (
            Math.abs(currentZoom - zoom) > 0.01 ||
            currentCenter.lat.toFixed(6) !== center[0].toFixed(6) ||
            currentCenter.lng.toFixed(6) !== center[1].toFixed(6)
        ) {
            map.flyTo(center, zoom, { animate: true, duration: 0.1 });
        }
    }, [zoom, center, map]);
    return null;
}

export default function ArbejdsRadiusMap(props) {

  const { indstillinger } = useIndstillinger();

  const defaultCenter = [55.6761, 12.5683];
  const [center, setCenter] = useState(
    props?.bruger?.arbejdsOmråde?.center?.length === 2
      ? props.bruger.arbejdsOmråde.center
      : defaultCenter
  );

  // const [center, setCenter] = useState(props?.bruger?.arbejdsOmråde?.center || [55.6761, 12.5683]);
  const [adresse, setAdresse] = useState(props?.bruger?.arbejdsOmråde?.adresse || "")
  const [radius, setRadius] = useState(props?.bruger?.arbejdsOmråde?.radius || 1000);
  const [zoom, setZoom] = useState(12); // midlertidig init, bliver beregnet efter mount

  // Mål overlay-cirklens faktiske px-størrelse (så JS == CSS)
  const circleRef = useRef(null);
  const [circlePx, setCirclePx] = useState(300);

  const user = props.user;
  const maxArbejdsRadius = indstillinger?.arbejdsområdeKilometerRadius * 1000

  console.log(props.bruger)
  if (!center || !Array.isArray(center) || center.length !== 2) return null;
  

  useEffect(() => {
    if (!circleRef.current) return;
 
    const update = () => {
      if (!circleRef.current) return;
      const w = circleRef.current.getBoundingClientRect().width;
      if (w > 0) setCirclePx(w);
    };

    // initial + on resize
    update();
    const ro = new ResizeObserver(update);
    ro.observe(circleRef.current);
    return () => ro.disconnect();
  }, []);

  // Genberegn zoom når radius, center-lat eller cirkel-px ændrer sig
    useEffect(() => {
        const newZoom = radiusToZoom(radius, center[0], circlePx);
        if (Math.abs(newZoom - zoom) > 0.01) { // undgå mikro-diff loops
            setZoom(newZoom);
        }
    }, [radius]);

    const fetchAddress = async (lat, lng) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const formateretAdresse = ((data.address.road ? data.address.road : "Et sted nær") + (data.address.house_number ? (" " + data.address.house_number) : "") + (data.address.road ? ", " : " ") + (data.address.postcode || "") + " " + (data.address.city || data.address.town || data.address.village || data.address.municipality || ""))
          setAdresse(formateretAdresse)
        } catch (err) {
          console.error("Geocoding fejl:", err);
        }
    };

    function CenterUpdater({ onMoveEnd }) {
        const map = useMapEvents({
        dragend: () => {
            const c = map.getCenter();
            onMoveEnd([c.lat, c.lng]);
            fetchAddress(c.lat, c.lng);
        }
        });
        return null;
    }

    const gemArbejdsOmråde = async () => {
      try {
        const brugerId = user.id; // typisk fra auth context eller prop
        const payload = {
          arbejdsOmråde: {
            center,
            radius,
            adresse
          }
        };
    
        const res = await axios.patch(`${import.meta.env.VITE_API_URL}/brugere/${brugerId}`, payload, {
          headers: {
              'Authorization': `Bearer ${user.token}`
          }
      });
        if (res.status === 200) {
          props.setRefetchBruger(!props.refetchBruger);
          props.setTrigger(false)
        }
      } catch (err) {
        console.error(err);
        alert("Noget gik galt ved gem.");
      }
    };
  
  return (
    <div className={Styles.mapRadiusSelectorContainer}>
        <h2>Hvor vil du arbejde?</h2>
        <p>Træk i kortet og tilpas cirklen herunder, så markeringen viser hvor du vil arbejde.</p>
      <div className={Styles.mainMapDiv} style={{ position: "relative" }}>
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          zoomSnap={0.01}
          zoomDelta={0.01}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <CenterUpdater onMoveEnd={setCenter} />
          <ZoomUpdater zoom={zoom} center={center} />
        </MapContainer>

        {/* Statisk cirkel i overlay — JS måler px automatisk */}
        <div
          ref={circleRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "300px",         // kan styres i CSS — JS måler den reelle px
            height: "300px",
            marginLeft: "-150px",
            marginTop: "-150px",
            borderRadius: "50%",
            border: "3px solid #59bf1a",
            backgroundColor: "rgba(89,191,26,0.2)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <div
            style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "10px",         // kan styres i CSS — JS måler den reelle px
            height: "10px",
            marginLeft: "-5px",
            marginTop: "-5px",
            borderRadius: "50%",
            border: "2px solid #3c5a3f",
            backgroundColor: "#59bf1a00",
            zIndex: 1020,
          }}
        />
      </div>
        
      </div>
        <div className={Styles.radiusSelectorDiv}>
            <p>Radius</p>
            <input
                type="range"
                min="200"
                max={maxArbejdsRadius}
                step="200"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className={Styles.slider}
            />
            <span className={Styles.radiusCounter}><Radius height={20} />{radius / 1000} km</span>
            
        </div>
        <div className={Styles.adresseDisplayDiv}>
            <p>Adresse</p>
            <p className={Styles.adresseDisplay}><MapPin height={20} />{adresse}</p>
        </div>
        <div className={Styles.submitButtons}>
          <button className={Styles.submitButton} onClick={gemArbejdsOmråde}>
            Gem
          </button>
          <button className={Styles.cancelButton} onClick={() => props.setTrigger(false)}>
            Annuller
          </button>
        </div>
    </div>
  );
}
