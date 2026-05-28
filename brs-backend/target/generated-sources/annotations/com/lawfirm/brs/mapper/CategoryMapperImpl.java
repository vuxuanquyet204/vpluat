package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.CategoryDTO;
import com.lawfirm.brs.entity.Category;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:02+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryDTO toDTO(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryDTO.CategoryDTOBuilder categoryDTO = CategoryDTO.builder();

        categoryDTO.parentId( categoryParentId( category ) );
        categoryDTO.id( category.getId() );
        categoryDTO.slug( category.getSlug() );
        categoryDTO.displayOrder( category.getDisplayOrder() );
        categoryDTO.metaTitleEn( category.getMetaTitleEn() );
        categoryDTO.metaTitleVi( category.getMetaTitleVi() );
        categoryDTO.metaDescEn( category.getMetaDescEn() );
        categoryDTO.metaDescVi( category.getMetaDescVi() );

        return categoryDTO.build();
    }

    @Override
    public CategoryDTO toDTOWithDetails(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryDTO.CategoryDTOBuilder categoryDTO = CategoryDTO.builder();

        categoryDTO.parentId( categoryParentId( category ) );
        categoryDTO.id( category.getId() );
        categoryDTO.slug( category.getSlug() );
        categoryDTO.displayOrder( category.getDisplayOrder() );
        categoryDTO.metaTitleEn( category.getMetaTitleEn() );
        categoryDTO.metaTitleVi( category.getMetaTitleVi() );
        categoryDTO.metaDescEn( category.getMetaDescEn() );
        categoryDTO.metaDescVi( category.getMetaDescVi() );

        return categoryDTO.build();
    }

    @Override
    public List<CategoryDTO> toDTOList(List<Category> categories) {
        if ( categories == null ) {
            return null;
        }

        List<CategoryDTO> list = new ArrayList<CategoryDTO>( categories.size() );
        for ( Category category : categories ) {
            list.add( categoryToCategoryDTO( category ) );
        }

        return list;
    }

    private UUID categoryParentId(Category category) {
        if ( category == null ) {
            return null;
        }
        Category parent = category.getParent();
        if ( parent == null ) {
            return null;
        }
        UUID id = parent.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected CategoryDTO categoryToCategoryDTO(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryDTO.CategoryDTOBuilder categoryDTO = CategoryDTO.builder();

        categoryDTO.id( category.getId() );
        categoryDTO.slug( category.getSlug() );
        categoryDTO.displayOrder( category.getDisplayOrder() );
        categoryDTO.metaTitleEn( category.getMetaTitleEn() );
        categoryDTO.metaTitleVi( category.getMetaTitleVi() );
        categoryDTO.metaDescEn( category.getMetaDescEn() );
        categoryDTO.metaDescVi( category.getMetaDescVi() );

        return categoryDTO.build();
    }
}
