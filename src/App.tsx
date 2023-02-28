import React, { useState, useRef, useEffect } from 'react'
import axios from "axios";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'

import { createTheme, ThemeProvider } from '@mui/material/styles';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ImageIcon from '@mui/icons-material/Image';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import EditIcon from '@mui/icons-material/Edit';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import ButtonGroup from '@mui/material/ButtonGroup';

import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import MainComponent from './components/MainComponent'
import TitlebarImageList from './TitlebarImageListComponent';
import StepperComponent from './components/StepperComponent';
import 'react-image-crop/dist/ReactCrop.css'
import './styles.css';


// const baseURL = "http://localhost:8000";
// const baseURL = "http://149.28.54.252:80";
const baseURL = "http://207.246.90.80:8000"

export default function App() {
  const [imgSrc, setImgSrc] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resultFilename, setResultFilename] = useState('')
  const [itemData, setItemData] = useState(new Array(0))
  const [imgResultSrc, setImgResultSrc] = useState<string | boolean>('')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [post, setPost] = React.useState(null);
  const [imageSize, setImageSize] = React.useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1)
  const [imageIndex, setImageIndex] = useState(0)
  const [imageArray, setImageArray] = useState(new Array(0))
  const [shoppingImageArray, setShoppingImageArray] = useState([''])
  // const [aspect, setAspect] = useState<number | undefined>(16 / 9)

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCurrentStep(2)
      setImageIndex(0)
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        // setImgSrc(reader.result?.toString() || ''),
        setImageArray(imageArray.concat(reader.result?.toString() || ''))
        console.log('onSelectFile imageArray', imageArray)
        // console.log('reader.result', reader.result?.toString())
      }
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img: any = e.target;
    setImageSize({
      width: img.width,
      height: img.height
    });

    // if (aspect) {
    //   const { width, height } = e.currentTarget
    //   setCrop(centerAspectCrop(width, height, aspect))
    // }
  }

  function onSubmit() {
    let sendData: any = null;
    const objectName = (document.getElementById('object-name') as any).value.trim();
    console.log(completedCrop)
    if (!completedCrop || (completedCrop && (completedCrop.width <= 0 || completedCrop.height <= 0))) {
      alert('Please select area.');
      return;
    } else {
      if (!objectName) {
        alert('Please input prompt.');
      } else {
        // let positionCrop: any = {};
        // positionCrop.x = imageSize.width * completedCrop.x / 100
        // positionCrop.y = imageSize.height * completedCrop.y / 100
        // positionCrop.width = imageSize.width * completedCrop.width / 100
        // positionCrop.height = imageSize.height * completedCrop.height / 100
        // console.log('positionCrop', positionCrop)

        sendData = {};
        sendData.cropRect = completedCrop;
        sendData.originImage = imageArray[imageIndex];
        // sendData.originSize = imageSize;
        sendData.prompt = objectName;
      }
    }
    setImgResultSrc(false);
    setItemData(new Array())
    setIsLoading(true)

    axios
      .post(`${baseURL}/show/`, sendData, {
        withCredentials: false
      })
      .then((response) => {
        setIsLoading(false)
        if (response.data.response_code === false) {
          setImgResultSrc('')
          alert('Image size is too big. Please select smaller one.');
        } else {
          setCurrentStep(3)
          setImageIndex(imageIndex + 1)
          // setImgResultSrc(response.data.data_url?.toString() || '')
          setImageArray(imageArray.concat(response.data.data_url?.toString() || ''))
          // setResultFilename(response.data.result_filename?.toString() || '')
          setShoppingImageArray(shoppingImageArray.concat(response.data.result_filename?.toString() || ''))

          console.log('imageIndex', imageIndex)
          console.log('imageArray', imageArray)

          // if(response.data.shopping_results.visual_matches)
          //   setItemData(response.data.shopping_results.visual_matches)
          // else
          //   setItemData(new Array())
        }
      });
  }

  function onChangeImage() {
    setCurrentStep(1)
    setCrop(undefined)
    setImageArray(Array(0))
    setShoppingImageArray([''])
  }

  function onEdit() {
    setCurrentStep(2)
    setCrop(undefined)
    setImageArray(imageArray.slice(0, imageIndex + 1))
    setShoppingImageArray(shoppingImageArray.slice(0, imageIndex + 1))
  }

  function onImageIndexRadioChanged(index: any) {
    console.log('onImageIndexRadioChanged')
    // setValue((event.target as HTMLInputElement).value);
    setImageIndex(index)
  };

  function onGetImages() {
    let sendData: any = null;
    sendData = {};
    sendData.result_filename = shoppingImageArray[imageIndex];

    console.log(imageIndex)
    console.log(shoppingImageArray)
    console.log(shoppingImageArray[imageIndex])
    console.log(sendData)

    setIsLoading(true)

    axios
      .post(`${baseURL}/show/get_images/`, sendData, {
        withCredentials: false
      })
      .then((response) => {
        setIsLoading(false)
        console.log('get_images', response)
        if (response.data.response_code === false) {

        } else {
          if (response.data.shopping_results.visual_matches)
            setItemData(response.data.shopping_results.visual_matches)
          else
            setItemData(new Array())
        }
      });
  }

  // useDebounceEffect(
  //   async () => {
  //     if (
  //       completedCrop?.width &&
  //       completedCrop?.height &&
  //       imgRef.current &&
  //       previewCanvasRef.current
  //     ) {
  //       // We use canvasPreview as it's much faster than imgPreview.
  //       canvasPreview(
  //         imgRef.current,
  //         previewCanvasRef.current,
  //         completedCrop,
  //         scale,
  //         rotate,
  //       )
  //     }
  //   },
  //   100,
  //   [completedCrop, scale, rotate],
  // )

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          {currentStep == 1 &&
            <Box>
              <Typography component="h1" variant="h4" align="center" sx={{ marginTop: 7 }}>
                VIRTUAL TRY ON
              </Typography>
              <Typography component="h1" variant="h4" align="center">
                A NEW WAY
              </Typography>
              <Typography component="h1" variant="h4" align="center" sx={{ marginBottom: 2 }}>
                TO SHOP
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <Box
                  component="img"
                  sx={{
                    borderRadius: 7,
                    marginBottom: 2,
                  }}
                  alt="The house from the offer."
                  src="static/images/noimage.png"
                />
                <Button variant="outlined" component="label" sx={{ position: 'absolute', bottom: '20%' }} >
                  Get Started
                  <input type="file" hidden accept="image/*" onChange={onSelectFile} />
                </Button>
              </Box>
              <Grid container>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="overline" display="block" gutterBottom>
                      Upload Your Pic to
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          }
          {currentStep == 2 &&
            <Grid container xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Typography variant="overline" gutterBottom sx={{ border: 'dotted 1px', padding: 0.3, borderRadius: 1 }}>
                  MASKING
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={onChangeImage}>
                  <EditIcon />
                </IconButton>
              </Grid>
            </Grid>
          }
          {currentStep != 1 &&
            <Grid container>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <div>
                  <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                  >
                    <CircularProgress color="inherit" />
                  </Backdrop>
                </div>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                {currentStep == 2 &&
                  <ReactCrop
                    crop={crop}
                    // onChange={(crop) => { setCrop(crop) }}
                    // onComplete={(crop) => { console.log(crop); setCompletedCrop(crop) }}
                    onChange={(_, percentCrop) => { setCrop(percentCrop) }}
                    onComplete={(_, percentCrop) => { console.log('onComplete', percentCrop); setCompletedCrop(percentCrop) }}
                  >
                    <div style={{ display: 'flex' }}>
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        // src={imgSrc}
                        src={imageArray[imageIndex]}
                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, borderRadius: 20 }}
                        onLoad={onImageLoad}
                      />
                    </div>
                  </ReactCrop>
                }
                {currentStep == 3 &&
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 2 }}>
                        <Button variant="outlined" component="label" onClick={onEdit}  >
                          Edit
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', position: 'relative' }}>
                            {/* <img
                              ref={imgRef}
                              alt="Crop me"
                              // src={imgResultSrc}
                              src={imageArray[imageIndex]}
                              style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, borderRadius: 20, maxHeight: 512 }}
                              onLoad={onImageLoad}
                            /> */}
                            {/* <Box
                              component="img"
                              sx={{
                                borderRadius: '20px',
                                maxHeight: '512px',
                                imageOrientation: 'from-image'
                              }}
                              alt="Result Image"
                              src={imageArray[imageIndex]}
                            /> */}
                            <div style={{ display: 'flex' }}>
                              <img
                                alt="Result"
                                // src={imgSrc}
                                src={imageArray[imageIndex]}
                                style={{ transform: `scale(${scale}) rotate(0deg)`, borderRadius: 20, imageOrientation: 'none' }}
                              />
                            </div>
                            <ButtonGroup
                              orientation="vertical"
                              aria-label="vertical contained button group"
                              variant="contained"
                              sx={{ position: 'absolute', bottom: '0', lineHeight: 1 }}
                              onChange={onImageIndexRadioChanged}
                            >
                              {(() => {
                                const buttons = [];
                                for (let i = imageArray.length - 1; i >= 0; i--) {
                                  buttons.push(<Button color={imageIndex === i ? "success" : "primary"} onClick={() => onImageIndexRadioChanged(i)}>{i}</Button>);
                                }
                                return buttons;
                              })()}
                            </ButtonGroup>
                          </div>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <Button variant="outlined" component="label" onClick={() => { onGetImages() }}>
                          Where to Buy
                        </Button>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, border: '1px solid lightgray' }}>
                        <TitlebarImageList itemData={itemData} ></TitlebarImageList>
                      </Grid>
                    </Grid>
                  </Grid>
                }
              </Grid>
            </Grid>
          }
          {currentStep == 2 &&
            <Grid container sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', margin: 'auto' }}>
                <InputBase
                  placeholder="Enter Prompt"
                  inputProps={{ 'aria-label': 'search google maps' }}
                  id="object-name"
                  sx={{ ml: 1, flex: 1, border: '1px solid', paddingLeft: 1, paddingRight: 1, borderRadius: 1 }}
                />
                <IconButton type="button" aria-label="search" onClick={onSubmit}>
                  <ArrowCircleRightIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
          }
        </Paper>
      </Container>
    </ThemeProvider>
  )

  // return (
  //   <div className="App" style={{ display: 'grid', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //     <div>
  //       <div className="gcse-search"></div>
  //       {/* <MainComponent></MainComponent> */}
  //       <div>
  //         <ReactCrop
  //           crop={crop}
  //           onChange={(crop) => {setCrop(crop)}}
  //           onComplete={(crop) => {console.log(crop); setCompletedCrop(crop)}}
  //           // onChange={(_, percentCrop) => {console.log(percentCrop); setCrop(percentCrop)}}
  //           // onComplete={(_, percentCrop) => {console.log(percentCrop); setCompletedCrop(percentCrop)}}
  //         >
  //           {!imgSrc ? <div className="image-pannel">
  //             Please select an image. <br/>Image should be typically close up and clear.
  //           </div> : <div className="image-pannel"><img
  //             ref={imgRef}
  //             alt="Crop me"
  //             src={imgSrc}
  //             style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
  //             onLoad={onImageLoad}
  //           /></div>}
  //         </ReactCrop>

  //         <div className="send-image-control">
  //           <div className="Crop-Controls">
  //             <input type="file" accept="image/*" onChange={onSelectFile} />
  //           </div>
  //           <div>
  //             <input type="text" id="object-name" />
  //           </div>
  //           <div>
  //             <button onClick={onSubmit}>Submit</button>
  //           </div>
  //         </div>
  //       </div>
  //       <div>
  //         {!imgResultSrc ? <div className="image-pannel" style={{}}>
  //           {imgResultSrc === false ? 'Please wait while processing...' : 'No result'}
  //         </div> : <div className="" style={{}}><img
  //           ref={imgRef}
  //           alt="Result"
  //           src={imgResultSrc}
  //           style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
  //           onLoad={onImageLoad}
  //         /></div>}
  //       </div>
  //     </div>
  //     <div>
  //       <Button variant="outlined" style={{marginTop: 20}} onClick={() => { onGetImages() }}>Get Related Images</Button>
  //       <TitlebarImageList itemData={itemData} ></TitlebarImageList>
  //     </div>
  //   </div>
  // )
}
