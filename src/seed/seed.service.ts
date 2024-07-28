import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

    private readonly axios: AxiosInstance = axios;

    constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel: Model<Pokemon>,
        private readonly http: AxiosAdapter, 
    ){}

    async executeSeed() {
        this.pokemonModel.deleteMany({}).exec();
        const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1500');
        /* metodo 1
        const insertPromisesArray = [];
        data.results.forEach( async({ name, url }) => {
            const segments = url.split('/');
            const no:number = +segments[segments.length - 2];
            insertPromisesArray.push(
                this.pokemonModel.create({ no, name })
            );
        });
        await Promise.all(insertPromisesArray);
        */

        // metodo 2
        const pokemonsToInsert: { name: string, no: number }[] = [];
        data.results.forEach(({ name, url }) => {
            const segments = url.split('/');
            const no:number = +segments[segments.length - 2];
            pokemonsToInsert.push({ no, name });
        });
        await this.pokemonModel.insertMany(pokemonsToInsert);
        return 'Seed executed';
    }
}
