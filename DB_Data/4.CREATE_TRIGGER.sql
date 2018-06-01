CREATE TRIGGER tag_cleaner
   AFTER UPDATE OF "count" ON "Tag" 
   FOR EACH ROW
   WHEN (new.count < 1)
   EXECUTE PROCEDURE delete_tag(id);

CREATE TRIGGER decrese_tag_count_t
   BEFORE DELETE ON "Item_Tag" 
   FOR EACH ROW
   EXECUTE PROCEDURE decrease_tag_count();
