import { useEffect, useState } from 'react';
import AddCategories from '../components/addCategories';
import api from '../services/api';

const adminCategories = () =>{

    return (
        <div>
            <AddCategories />
        </div>
    );
}

export default adminCategories;