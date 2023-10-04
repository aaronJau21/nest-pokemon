import { Module } from '@nestjs/common';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    PokemonModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/pokemon'),
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
