import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

    private defaultLimit: number;
    private defaultOffset: number;

    constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel: Model<Pokemon>,
        private readonly configService: ConfigService,
    ) {
        this.defaultLimit = this.configService.get<number>('defaultLimit');
        this.defaultOffset = this.configService.get<number>('defaultOffset');
     }


    async create(createPokemonDto: CreatePokemonDto) {
        createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
        try {
            const pokemon = await this.pokemonModel.create(createPokemonDto);
            return pokemon;
        }
        catch (error) {
            this.handleExceptions(error);
        }
    }

    findAll(paginationDto: PaginationDto) {
        const { limit = this.defaultLimit, offset = this.defaultOffset } = paginationDto;
        return this.pokemonModel.find()
            .skip(offset)
            .limit(limit)
            .sort({ no: 1 })
            .select('-__v');
    }

    async findOne(term: string) {
        let pokemon: Pokemon;
        if (!isNaN(+term)) {
            pokemon = await this.pokemonModel.findOne({ no: term });
        }

        if (isValidObjectId(term)) {
            pokemon = await this.pokemonModel.findById(term);
        }

        if (!pokemon) {
            pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
        }

        if (!pokemon) {
            throw new NotFoundException('Pokemon not found');
        }
        return pokemon;
    }

    async update(term: string, updatePokemonDto: UpdatePokemonDto) {
        const pokemon = await this.findOne(term);
        if (updatePokemonDto.name) {
            updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
        }
        try {
            Object.assign(pokemon, updatePokemonDto);
            return await pokemon.save();
        }
        catch (error) {
            this.handleExceptions(error);
        }

    }

    async remove(id: string) {
        const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({ _id: id });
        if (deletedCount === 0) {
            throw new NotFoundException('Pokemon not found');
        }
        if (!acknowledged) {
            throw new InternalServerErrorException('Error deleting pokemon');
        }
        return true;
    }

    private handleExceptions(error: any) {
        if (error.code === 11000) {
            throw new BadRequestException('Pokemon already exists');
        }
        console.log(error);
        throw new InternalServerErrorException('Error creating pokemon');
    }

}
