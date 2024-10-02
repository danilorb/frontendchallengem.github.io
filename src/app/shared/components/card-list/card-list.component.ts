import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CharacterService } from '../../../core/services/character.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MessageComponent } from '../message/message.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  providers: [CharacterService],
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, MessageComponent, InfiniteScrollModule, MatProgressSpinnerModule],
})
export class CardListComponent {
  characters: any[] = [];
  page: number = 1;
  isSearching: boolean = false; // Estado de busca
  @Input() searchTerm: string = '';  // Termo de busca para filtrar personagens
  @Input() isFavorite: boolean = false;  // Indica se está no modo favoritos
  @Output() favoriteCountChange = new EventEmitter<number>();  // Emite mudanças na contagem de favoritos
  isLoading: boolean = false; // Estado de carregamento

  constructor(
    private characterService: CharacterService,
    public favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadCards();  // Carrega os personagens ao iniciar o componente
  }

  // Carrega os personagens e adiciona ao array existente
  loadCards(): void {
    if (this.isLoading) return;  // Previne múltiplos carregamentos simultâneos

    this.isLoading = true;
    this.characterService.getCharacters(this.page).subscribe((data) => {
      this.characters = [...this.characters, ...data.results];  // Adiciona ao array existente
      this.isLoading = false;  // Desativa o carregamento
      this.emitFavoriteCount();  // Atualiza a contagem de favoritos
    }, error => {
      console.error('Erro ao carregar personagens:', error);
      this.isLoading = false;  // Mesmo em caso de erro, desativar o estado de carregamento
    });
  }

  // Retorna a lista filtrada de personagens, considerando o termo de busca e o modo de favoritos
  get filteredCharacters(): any[] {
    let filtered = this.characters.filter((character) =>
      character.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.isFavorite) {
      filtered = filtered.filter((character) =>
        this.favoriteService.isFavorite(character)
      );
    }

    return filtered;
  }

  // Adiciona ou remove um personagem dos favoritos
  toggleFavorite(character: any): void {
    if (this.favoriteService.isFavorite(character)) {
      this.favoriteService.removeFavorite(character);  // Remove dos favoritos
    } else {
      this.favoriteService.addFavorite(character);  // Adiciona aos favoritos
    }
    this.emitFavoriteCount();  // Atualiza a contagem de favoritos ao adicionar/remover
  }

  // Emite o número atual de itens favoritados
  emitFavoriteCount(): void {
    const favoriteCount = this.favoriteService.getFavoriteCount();
    this.favoriteCountChange.emit(favoriteCount);  // Atualiza o header
  }

  // Método chamado quando o usuário atinge o final da lista
  onScrollDown(): void {
    this.page++;
    this.loadCards();  // Carrega mais personagens
  }

  // Método para rastrear itens em uma lista
  trackById(index: number, character: any): number {
    return character.id; // Supondo que 'id' seja uma propriedade única de cada personagem
  }
}
