namespace VkApp.Data.Model
{
    public class User
    {
        public virtual int VkUserId { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
    }
}