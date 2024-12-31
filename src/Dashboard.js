import { useCallback, useEffect, useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Title,
  Box,
  createStyles,
  Paper,
  RingProgress,
  Center,
  Group, Switch, Avatar, Divider, Button, Container, NumberInput, Tabs, ScrollArea, Progress, Loader, List, Anchor
} from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useViewportSize } from '@mantine/hooks';
import { MapContainer, CircleMarker, GeoJSON, LayersControl, TileLayer, Polyline } from "react-leaflet";
import WildBeastLines from './wildbeastLines';
import WildBeastPoints from './WildBeastPoints';
import L, { LatLngExpression } from "leaflet"
import { AdjustmentsAlt, ArrowDownLeft, ArrowUpRight, Clock, ClockHour1, Gps, Line as LineIcon, Palette, PaletteOff, Video, VideoOff } from 'tabler-icons-react';
import NDVIStatistics from './Statistics';
import Points from './WildBeestPoints';
import NDVIStatistics2 from './DynamicChart';
import ProtectedAreas from './ProtectedAreas';
import Streams from './Streams';

const turf = require("@turf/turf");

const useStyles = createStyles((theme) => ({
  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },

  inner: {
    height: 70,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  search: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  navbar: {
      paddingTop: 0,
    },
  
    section: {
      marginLeft: -theme.spacing.md,
      marginRight: -theme.spacing.md,
      marginBottom: theme.spacing.md,
  
    },
  
    searchCode: {
      fontWeight: 700,
      fontSize: 10,
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      border: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2]
      }`,
    },
  
    mainLinks: {
      paddingLeft: theme.spacing.md - theme.spacing.xs,
      paddingRight: theme.spacing.md - theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
  
    mainLink: {
      display: 'flex',
      cursor: 'text',
      alignItems: 'center',
      width: '100%',
      fontSize: theme.fontSizes.xs,
      padding: `8px ${theme.spacing.xs}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
  
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      },
    },
  
    mainLinkInner: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
    },
  
    mainLinkIcon: {
      marginRight: theme.spacing.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
    },
  
    mainLinkBadge: {
      padding: 0,
      width: 20,
      height: 20,
      pointerEvents: 'none',
    },
  
    collections: {
      paddingLeft: theme.spacing.md - 6,
      paddingRight: theme.spacing.md - 6,
      paddingBottom: theme.spacing.md,
    },
  
    collectionsHeader: {
      paddingLeft: theme.spacing.md + 2,
      paddingRight: theme.spacing.md,
      marginBottom: 5,
    },

    root: {
      position: 'relative',
      '& *': {
        cursor: 'pointer',
      },
    },
  
    collectionLink: {
      display: 'block',
      padding: `8px ${theme.spacing.xs}px`,
      textDecoration: 'none',
      cursor: 'text',
      borderRadius: theme.radius.sm,
      fontSize: theme.fontSizes.xs,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
      lineHeight: 1,
      fontWeight: 500,
  
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      },
    },

    animalBody: {
      paddingLeft: 54,
      paddingTop: theme.spacing.sm,
    },
}));

export default function Dashboard() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const { height, width } = useViewportSize();
  const [basemap, setBasemap] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [coords, setCoords] = useState([]);
  const [pos, setPos] = useState(0);
  const [lineCoords, setLineCoords] = useState([]);
  const [timestamp, setTimeStamp] = useState("");
  const [dist, setDist] = useState(0);
  const [time, setTime] = useState(1.0);
  const [mean, setMean] = useState(0.5);
  const [below, setBelow] = useState(0);
  const [above, setAbove] = useState(0);
  const [ndvi, setNDVI] = useState(0);
  const [ndviDiff, setNDVIDiff] = useState(0);
  const [month, setMonth] = useState("5");
  const [data, setData] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sum = 0;
    let i =0;

    while(i < Points.features.length){
      let item = Points.features[i].properties.ndvi;
      sum = sum + item;
      i++;
    }
    setMean(sum / Points.features.length);
  }, [])

  useEffect(() => {
    let belowMean = 0;
    let aboveMean = 0;

    let i = 0;

    while(i < Points.features.length){
      let item = Points.features[i].properties.ndvi;

      if(item > mean){
        aboveMean += 1;
      } else {
        belowMean += 1;
      }

      i++;
    }

    setBelow(belowMean);
    setAbove(aboveMean);

  }, [mean]);


  useEffect(() => {
    let timer;

    if(playing){
      timer = setInterval(function(){
        setPos(prevPos => prevPos + 1);
      }, (time * 1000));
  
    }

    return () => {
      clearInterval(timer);
    }
  },[time, playing]);


  useEffect(() => {
    let item = Points.features[pos].properties;
    let newNDVI = item.ndvi;

    if(coords.length !== 0){
      let newCoord = [item.latitude, item.longitude];

      let lastCoord = [coords[0].Latitude, coords[0].Longitude];
  
      var from = turf.point(lastCoord);
      var to = turf.point(newCoord);
      var options = {units: 'miles'};
  
      var distance = turf.distance(from, to, options);

      setDist(distance.toFixed(2));

      let lastNDVI = ndvi;

      setNDVIDiff(newNDVI - lastNDVI);

    }
    setNDVI(newNDVI);
    setCoords([{Latitude: item.latitude, Longitude: item.longitude}]);
    setTimeStamp(item.timestamp);
    setLineCoords(prevArr => ([...prevArr, [item.latitude, item.longitude]]));
  }, [pos]);

  const TimeframePanel = () => {
    return (
      <Container sx={(theme) => ({[theme.fn.smallerThan('md')]: { display: 'none' },})} size={300} className='leaflet-bottom leaflet-right'>
      <Container size={300} className="leaflet-control leaflet-bar" sx={(theme) => ({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8]  : "#ffff",
      height: 200,
      width: 300,
      bottom: 15
    })} >
        <Paper sx={(theme) => ({
          height: '100%',
           width: '100%',
           backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8]  : "#ffff",
        })}>
            <Text size="xs" color="dimmed">
                  NDVI comparison with previous spot
                </Text>
              <NDVIStatistics2 name={timestamp} prev={(ndvi - ndviDiff)} ndvi={ndvi} />
            </Paper>
      </Container>
      </Container>
    )
  }

  const MapPanel = () => {
    return (
      <Container size={400} className='leaflet-bottom leaflet-left'>
        <Container size={400} className="leaflet-control leaflet-bar" sx={(theme) => ({
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : "#ffff",
        height: 400,
        width: 300,
      })} >

        <>
        <Group mt={5} >
        <img width={100} height={100} style={{borderRadius: 80}} src="https://media.istockphoto.com/photos/blue-wildebeest-connochaetes-taurinus-picture-id93213400?b=1&k=20&m=93213400&s=170667a&w=0&h=B_3JbFe_RJ8nwR8AaEePTyiHAfCHclMU8TpAXpFEhoI=" alt="Wild Beast" radius="xl" />
        <div>
          <Title order={4} size="sm">White-bearded Wildebeest</Title>
          <Text size="xs" color="dimmed">
            <i>Connochaetes taurinus</i>
          </Text>
        </div>
      </Group>
            <Group mt={20} grow>
              <Group>
                <Clock />
                <Text>Timestamp:<Text><strong>{timestamp}</strong></Text></Text>
              </Group>
            </Group>

            <Group mt={20} grow>
              <Group>
                <LineIcon />
                <Text>Distance Travelled:<Text><strong>{dist + " Miles"}</strong></Text></Text>
              </Group>
            </Group>

            <Group mt={20} grow>
              <Group>
                <Palette />
                <Text>NDVI:<Text><strong>{ndvi.toFixed(2)}</strong></Text></Text>
              </Group>
            </Group>

            <Group mt={20} grow>
              <Group>
                <PaletteOff />
                <Text>NDVI Difference:<Text><strong>{ndviDiff.toFixed(2)}</strong></Text></Text>
              </Group>
            </Group>
            </>
        </Container>
      </Container>
    )
  }
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      aside={
        <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 300, lg: 400 }}>
            <Box sx={(theme) => ({
              height: (height - 60) * 0.5
            })}>
            <Tabs defaultValue="summary">
              <Tabs.List>
                <Tabs.Tab value="summary">Project Summary</Tabs.Tab>
                <Tabs.Tab value="stats">Statistics</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value='summary' >
                <Title>Introduction</Title>
              <Text mt={5} mb={10} size="sm" inline >
        GPS data on Wildlife movement patterns combined with EO data can be used to establish the link between animal trajectories and other environmental indicators.
        <br />
        In particular,GPS data at an interval of one hour is used to 
        provide information on animal trajectory, while EO data from <Anchor target="_blank" href='https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD13Q1' >MODIS/061/MOD13Q1</Anchor> is used to calculate NDVI change that occured while the animal was at a particular spot.
        <br />
        Although the current scope of this project covers NDVI analysis only, further improvements are being made on the dashboard
        to compare the GPS dataset with other indices
        <br />
        This in turn will provide rangers and interested researchers with crucial information on different attributes of different
        animals on how they link with different environmental indicators.
      </Text> 
      <Title>Dataset & Tools</Title>
      <List mt={5} size="sm">
        <List.Item ><Text size="sm" inline >African Rivers from <Anchor target="_blank" href='https://africa-knowledge-platform.ec.europa.eu/dataset/riversaf' >Africa Knowledge Platform</Anchor></Text></List.Item>
        <List.Item> <Text size="sm" inline >GPS dataset from <Anchor target="_blank" href='https://www.movebank.org/cms/movebank-main' >Movebank.org</Anchor></Text></List.Item>
        <List.Item> <Text size="sm" inline >Protected areas <Anchor target="_blank" href='https://www.protectedplanet.net/en' >Protected planet</Anchor></Text></List.Item>
      </List>
              </Tabs.Panel>
              <Tabs.Panel  value='stats'>
                <ScrollArea  style={{ height: (height - 60)}} >
                <Text mt={20} mb={10} >Total GPS Points: <strong>{Points.features.length}</strong> </Text>
            <Text mb={20}  >Mean NDVI: <strong>{mean.toFixed(2)}</strong></Text>
          <Paper withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (above / Points.features.length) * 100, color: "green" }]}
            label={
              <Center>
                <ArrowUpRight />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Points Above Mean NDVI
                </Text>
                <Text weight={700} size="xl" >
                {above}
                </Text>
              </div>
            </Group>
          </Paper>

          <Paper mt={5} withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (below / WildBeastPoints.features.length) * 100, color: "red" }]}
            label={
              <Center>
                <ArrowDownLeft />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Points Below Mean NDVI
                </Text>
                <Text weight={700} size="xl" >
                {below}
                </Text>
              </div>
            </Group>
          </Paper>

            <Paper mt={5} withBorder radius="md" p="xs" style={{height: 220}}>
            <Text mb={5} size="xs" color="dimmed">
                  NDVI(May - September)
                </Text>
              <NDVIStatistics />
            </Paper>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>
            </Box>
          </Aside>
        </MediaQuery>
      }
      header={
        <Header height={60} className={classes.header}>
          <div className={classes.inner}>
            <Group >
            <Title>EcoWild</Title>
            </Group>

            <Group ml={50} spacing={5} className={classes.links}>
              
          </Group>
          
          <Group noWrap>
          <MediaQuery smallerThan="md" styles={{display: "none"}}>
            <Switch label="Basemap" checked={basemap} onChange={() => setBasemap(!basemap)} size="md" />
          </MediaQuery>

          <MediaQuery smallerThan="sm" styles={{display: "none"}}>
            <NumberInput icon={<ClockHour1 />} min={0} max={10} value={time} step={0.5} precision={2} onChange={(val) => {setTime(val)}} placeholder="Timelapse interval" />
            </MediaQuery>
            <Button variant='outline' onClick={() => {setPlaying(!playing)}} leftIcon={playing ? <VideoOff /> : <Video />} >{playing ? "Pause Movements" : "Play Movements"}</Button>
              
            <MediaQuery smallerThan="sm" styles={{display: "none"}}>
            <Button variant='outline' onClick={() => {
                setPlaying(false);
                setPos(0);
                setCoords([]);
                setLineCoords([]);

              }} leftIcon={<AdjustmentsAlt />} >Reset Player</Button>
            </MediaQuery>
          </Group>
          </div>
        </Header>
      }
    >
        <MapContainer center={coords.length === 0 ? [-1.3351225,35.2926247] : [coords[0].Latitude, coords[0].Longitude]} style={{backgroundColor: "black", height: "100%", width: '100%', padding: 0}} zoom={10}>
        <LayersControl position='topright' >
            {basemap ? (
              <>
      <LayersControl.BaseLayer name='OSM'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url= "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    />
    </LayersControl.BaseLayer>
    <LayersControl.BaseLayer checked={basemap} name='Satellite'>
    <TileLayer
      attribution='&copy; Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
    </LayersControl.BaseLayer>
              </>
            ) : null}

              <LayersControl.Overlay checked name='Streams'>
                <GeoJSON data={Streams} style={(feature) => {
      return {
        color: "#3BC9DB",
        fillColor: "#3BC9DB",
        weight: 0.5
      }
    }} />
              </LayersControl.Overlay>
      </LayersControl>

          <Polyline positions={lineCoords} pathOptions={{color: 'white', fillColor: 'white', weight: 0.5,}} color="white" />
            {coords !== null ? (
              coords.map((item, index) => {
                return (
                  <CircleMarker key={"points-"+index} color='yellow' fillColor='yellow' fillOpacity={0.7} opacity={0.7} radius={5} center={[item.Latitude, item.Longitude]}> 
                  </CircleMarker>
                )
              })
            ) : null}

            <MapPanel />
            <TimeframePanel />
        </MapContainer>
    </AppShell>
  );
}
