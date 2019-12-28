using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using Newtonsoft.Json;
using VkApp.Data;

namespace VkApp.Web.Infrastructure
{
    public class AuthToken
    {
        public const string AuthTokenKey = "AuthToken";

        public string Role { get; set; }
        public string Token { get; set; }

        public static AuthToken Create(string role, string password)
        {
            return new AuthToken
            {
                Role = role,
                Token = HashCalculator.Calculate(password)
            };
        }

        public static string Encrypt(AuthToken token)
        {
            var serialized = JsonConvert.SerializeObject(token);
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(serialized);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static AuthToken Decrypt(string encodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(encodedData);
            var serialized = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
            return JsonConvert.DeserializeObject<AuthToken>(serialized);
        }
    }
}