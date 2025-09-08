"use client"

import { createContext, useContext , useState, useEffect} from 'react';

const GlobalContext = createContext();

export default function Context({children}){

    const [schedule, setSchedule]= useState({})
    const [schedule_entries, setScheduleEntries]= useState(9)

    async function getSchedule() {
        let result;
        const url = "/ap1/v1/radio/schedule";
        try {
        const response = await fetch(url, {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        });
        result = await response.json();
        } finally {
            setSchedule(result)
        }
    }
        
    const [radio_data, setRadioData]=useState({})

    async function getRadioData(){
        let result;
        const url = "/ap1/v1/radio/now_playing"
        try {
            const response = await fetch(url, {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        });
            const data = await response.json();
            result = data
            
        } finally {
            setRadioData(result.log)
        }
    }
        
    const [last_sets, setLastSets]=useState([])

    async function getLastSets(){
        let result;
        const url = "/ap1/v1/radio/sets/latests"
        try {
            const response = await fetch(url, {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        });
            const data = await response.json();
            result = data
            
        } finally {
            if(result?.log){
                setLastSets(result.log)
                localStorage.setItem("last-sets-list",JSON.stringify(result.log));
            }
            
        }
    }
        
    const [last_djs, setLastDJs]=useState([])

    async function getLastDJs(){
        let result;
        const url = "/ap1/v1/radio/artists/latests"
        try {
            const response = await fetch(url, {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        });
            const data = await response.json();
            result = data
            
        } finally {
            if (result?.log){
                setLastDJs(result.log)
                localStorage.setItem("last-djs-list",JSON.stringify(result.log))
            }
        }
    }
        
    const [artists_list, setArtistList]=useState([])

    async function getArtistList(){
        let result;
        const url = "/ap1/v1/radio/artists"
        try {
            const response = await fetch(url, {
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        });
            const data = await response.json();
            result = data
            
        } finally {
            if (result?.log){
                setArtistList(result.log)
                localStorage.setItem("artist-list",JSON.stringify(result.log));
            }
            
        }
    }
    
    const [media_played, setMediaPlayed]=useState("/ap1/v1/radio/mountpoints/tntr128.mp3")
    const [act_set_metadata, setActSetMetadata]=useState({artist:"",title:"",duration:""})
    const [is_radio_playing, setRadioPlaying]=useState(true)
    const [img_from_playing, setImgFromPlaying]=useState("/DefaultIMG.png")
    const [is_media_paused, setMediaPaused]=useState(true)
    const [one_second_time_signal, setOneSecondTimeSignal]=useState(false)
    const [radio_mountpoint_select, setRadioMountPoint]=useState(media_played)
    const [player_opened, openPlayer] = useState(false);    
    const [radio_current_time,setRadioCurrentTime] = useState(0);

    const [header_menu_opened, setHeaderMenuOpened]=useState(false)

    useEffect(() => {
        //setArtistList(localStorage.getItem("artist-list") || [])
        getRadioData();
        getLastSets();
        getLastDJs();
        getArtistList();

        //Requêtes avec timer régulier
        const radio_data_interval = setInterval(() => {
            getRadioData();
        }, 20_000);

        getRadioData();
        const schedule_interval = setInterval(() => {
            getSchedule(schedule_entries);
        }, 60_000);

        return () => {clearInterval(radio_data_interval);clearInterval(schedule_interval)};
    }, []);



    //Hooks d'update

    useEffect(() => {
        getSchedule()
    }, [schedule_entries]);

    return (
        <GlobalContext.Provider value={{ schedule, setScheduleEntries , radio_data, last_djs, last_sets, artists_list, media_played, setMediaPlayed, is_radio_playing, setRadioPlaying, img_from_playing, setImgFromPlaying, is_media_paused, setMediaPaused, act_set_metadata, setActSetMetadata, one_second_time_signal, setOneSecondTimeSignal, header_menu_opened, setHeaderMenuOpened, radio_mountpoint_select, setRadioMountPoint, player_opened, openPlayer, radio_current_time,setRadioCurrentTime }}>
            {children}
        </GlobalContext.Provider>
        );
}
export function useGlobalContext() {
    return useContext(GlobalContext);
    }