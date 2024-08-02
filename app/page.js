'use client';
import React, {useState, useEffect} from 'react';
import { Box, Stack, Typography, TextField, Button, IconButton, Card, CardContent, Fade } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import {db} from './firebase';
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';




const StyledBaseNumberInput = styled(BaseNumberInput)`
  & .MuiInputBase-root {
    height: 56px;  // Adjust this value to match your TextField height
  }
`;

const CustomNumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  return (
    <StyledBaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInputElement,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: '▴',
        },
        decrementButton: {
          children: '▾',
        },
      }}
      {...props}
      ref={ref}
    />
  );
});




export default function Home() {

  const [itemValue, setItem] = useState('');
  const [itemNum, setItemNum] = useState(1);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  // read data from db
  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const handleNumberInputChange = (event, newValue) => {
    setItemNum(newValue);
  };

  // Add data to  db
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleSubmit = async () => {
    if (itemValue && itemNum) {
      const capitalizedItemValue = capitalizeFirstLetter(itemValue.trim());
      try {
        // Check if item already exists
        const q = query(collection(db, "items"), where("name", "==", capitalizedItemValue));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Item exists, update quantity
          const existingItem = querySnapshot.docs[0];
          const newQuantity = parseInt(existingItem.data().quantity) + parseInt(itemNum);
          await updateDoc(doc(db, "items", existingItem.id), {
            quantity: newQuantity
          });
          
          setItems(items.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity } 
              : item
          ));
          
          console.log("Item quantity updated");
        } else {
          // Item doesn't exist, add new item
          const docRef = await addDoc(collection(db, "items"), {
            name: capitalizedItemValue,
            quantity: parseInt(itemNum)
          });
          
          setItems([...items, { id: docRef.id, name: capitalizedItemValue, quantity: parseInt(itemNum) }]);
          
          console.log("New item added with ID: ", docRef.id);
        }
        
        setItem('');
        setItemNum(1);
      } catch (error) {
        console.error("Error adding/updating document: ", error);
      }
    } else {
      console.log("Please fill in both item name and quantity");
    }
  };

  // Delete data from db
  const handleDelete = async (id) => {
    const item = items.find(item => item.id === id);
    if (item) {
      if (item.quantity > 1) {
        try {
          const newQuantity = item.quantity - 1;
          await updateDoc(doc(db, "items", id), { quantity: newQuantity });
          setItems(items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
          console.log("Item quantity reduced by 1");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      } else {
        try {
          await deleteDoc(doc(db, "items", id));
          setItems(items.filter(i => i.id !== id));
          console.log("Item successfully deleted!");
        } catch (error) {
          console.error("Error removing document: ", error);
        }
      }
    }
  };
  

  return (
  <ThemeProvider theme={theme}> 
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        bgcolor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Card sx={{ width: "800px", overflow: 'visible' }}>
        <CardContent>
          <Typography variant="h2" color="primary" textAlign="center" gutterBottom>
            Pantry Items
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              mb: 4,
            }}
          >
            <TextField 
              value={itemValue}
              onChange={(e) => setItem(e.target.value)} 
              label='Item Name'
              required
              fullWidth
            />
            <Box width="150px">
              <CustomNumberInput 
                aria-label='Item Quantity'
                placeholder="Quantity" 
                value={itemNum}
                onChange={handleNumberInputChange}
                required
                min={1}
              />
            </Box>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleSubmit}
              sx={{ height: 56 }}
            >
              Add Item
            </Button>
          </Box>
          <Stack spacing={2}>
            {items.map((item) => (
              <Fade in={true} key={item.id}>
                <Card elevation={2}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mx: 2 }}>
                      Quantity: {item.quantity}
                    </Typography>
                    <IconButton onClick={() => handleDelete(item.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
    </ThemeProvider>
  );
}



const blue = {
  100: '#DAECFF',
  200: '#80BFFF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};




const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    border-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};

    &:hover {
      cursor: pointer;
      color: #FFF;
      background: ${theme.palette.mode === 'dark' ? blue[600] : blue[500]};
      border-color: ${theme.palette.mode === 'dark' ? blue[400] : blue[600]};
    }
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    border-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &:hover {
    cursor: pointer;
    color: #FFF;
    background: ${theme.palette.mode === 'dark' ? blue[600] : blue[500]};
    border-color: ${theme.palette.mode === 'dark' ? blue[400] : blue[600]};
  }

  & .arrow {
    transform: translateY(-1px);
  }

  & .arrow {
    transform: translateY(-1px);
  }
`,
);