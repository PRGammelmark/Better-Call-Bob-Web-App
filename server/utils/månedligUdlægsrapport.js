import Postering from "../models/posteringModel.js";
import Bruger from "../models/brugerModel.js";
import dayjs from "dayjs";
import 'dayjs/locale/da.js'; // importer dansk locale
import { sendEmail } from "../emailService.js";

export const månedligUdlægsrapport = async () => {
    
    // Definer tidsmæssig afgrænsning for udlægsrapporten
    const startOfDenneMåned = dayjs().date() >= 20 ? dayjs().date(20) : dayjs().subtract(1, 'month').date(20);
    const endOfDenneMåned = startOfDenneMåned.add(1, 'month').date(19);

    const sidsteLønperiode = {
        start: startOfDenneMåned.subtract(1, 'month'),
        end: endOfDenneMåned.subtract(1, 'month')
    }

    const startOfSidsteLønperiode = sidsteLønperiode.start.format('YYYY-MM-DD');
    const endOfSidsteLønperiode = sidsteLønperiode.end.format('YYYY-MM-DD');

    // Hent alle medarbejdere
    const medarbejdere = await Bruger.find({}).select("navn id");
}