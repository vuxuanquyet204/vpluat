package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.CategoryDTO;
import com.lawfirm.brs.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryMapper {

    @Named("categoryToDTO")
    @Mapping(target = "parentId", source = "parent.id")
    CategoryDTO toDTO(Category category);

    @Named("categoryToDTOWithDetails")
    @Mapping(target = "parentId", source = "parent.id")
    CategoryDTO toDTOWithDetails(Category category);

    List<CategoryDTO> toDTOList(List<Category> categories);
}
