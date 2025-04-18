-- Drop view if it exists
DROP VIEW IF EXISTS effective_pupil_needs CASCADE;

-- Create the fixed view that calculates effective needs for pupils
CREATE VIEW effective_pupil_needs AS
SELECT 
    p.pupil_id,
    n.need_id,
    n.name,
    n.short_description,
    n.description,
    CASE
        WHEN o.is_added = TRUE THEN 'Added manually'
        ELSE (
            SELECT string_agg(c.category_name, ', ')
            FROM category c
            JOIN category_need cn ON c.category_id = cn.category_id
            JOIN pupil_category pc ON c.category_id = pc.category_id
            WHERE cn.need_id = n.need_id
              AND pc.pupil_id = p.pupil_id
        )
    END AS sources
FROM 
    pupil p
CROSS JOIN 
    need n
LEFT JOIN 
    pupil_need_override o ON p.pupil_id = o.pupil_id AND n.need_id = o.need_id
WHERE
    (
        -- Include needs from categories
        EXISTS (
            SELECT 1
            FROM pupil_category pc
            JOIN category_need cn ON pc.category_id = cn.category_id
            WHERE pc.pupil_id = p.pupil_id AND cn.need_id = n.need_id
        )
        -- Or needs explicitly added
        OR (o.pupil_id IS NOT NULL AND o.is_added = TRUE)
    )
    -- But exclude needs explicitly removed
    AND NOT EXISTS (
        SELECT 1
        FROM pupil_need_override 
        WHERE pupil_id = p.pupil_id 
        AND need_id = n.need_id 
        AND is_added = FALSE
    );

-- Grant permissions on the view
GRANT SELECT ON effective_pupil_needs TO webuser;

-- Create new view with fixed logic
CREATE OR REPLACE VIEW fixed_pupil_needs AS
SELECT 
    p.pupil_id,
    n.need_id,
    n.name,
    n.short_description,
    n.description,
    CASE
        WHEN o.is_added = TRUE THEN 'Added manually'
        ELSE (
            SELECT string_agg(c.category_name, ', ')
            FROM category c
            JOIN category_need cn ON c.category_id = cn.category_id
            JOIN pupil_category pc ON c.category_id = pc.category_id
            WHERE cn.need_id = n.need_id
              AND pc.pupil_id = p.pupil_id
        )
    END AS sources
FROM 
    pupil p
CROSS JOIN 
    need n
LEFT JOIN 
    pupil_need_override o ON p.pupil_id = o.pupil_id AND n.need_id = o.need_id
WHERE
    (
        -- Include needs from categories
        EXISTS (
            SELECT 1
            FROM pupil_category pc
            JOIN category_need cn ON pc.category_id = cn.category_id
            WHERE pc.pupil_id = p.pupil_id AND cn.need_id = n.need_id
        )
        -- Or needs explicitly added
        OR (o.pupil_id IS NOT NULL AND o.is_added = TRUE)
    )
    -- But exclude needs explicitly removed
    AND NOT EXISTS (
        SELECT 1
        FROM pupil_need_override 
        WHERE pupil_id = p.pupil_id 
        AND need_id = n.need_id 
        AND is_added = FALSE
    ); 