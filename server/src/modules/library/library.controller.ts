import { Controller, Get } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: 'Get public library models' })
  findAll() {
    return this.libraryService.findAll();
  }
}
