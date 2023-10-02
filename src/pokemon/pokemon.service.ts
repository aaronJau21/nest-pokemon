import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonDB: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonDB.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.error(error);
    }
  }

  findAll() {
    const pokemons = this.pokemonDB.find();
    return pokemons;
  }

  async findOne(params: string) {
    let pokemon: Pokemon;

    if (!isNaN(+params)) {
      pokemon = await this.pokemonDB.findOne({ no: params });
    }

    if (!pokemon && isValidObjectId(params)) {
      pokemon = await this.pokemonDB.findById(params);
    }

    if (!pokemon) {
      pokemon = await this.pokemonDB.findOne({
        name: params.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no "${params}" not found`,
      );

    return pokemon;
  }

  async update(params: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(params);

    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON, ...updatePokemonDto };
    } catch (error) {
      this.error(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonDB.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }

    return;
  }

  private error(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
